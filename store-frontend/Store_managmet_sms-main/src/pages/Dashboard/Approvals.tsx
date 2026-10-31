import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaCheck,
  FaCheckCircle,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaEye,
  FaFileInvoice,
  FaTimes,
  FaTruck,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  ENDPOINTS,
  type Grn,
  type Srn,
} from "../../services/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  StatCard,
  Table,
  TableWrap,
  Tabs,
  Td,
  Th,
  Tr,
  useToast,
  Textarea,
} from "../../components/ui";
import {
  currency,
  errorMessage,
  formatDate,
  statusLabel,
  statusTone,
} from "../../lib/format";

type Tab = "grn" | "srn";

const Approvals = () => {
  const { user } = useAuth();
  const toast = useToast();
  const role = user?.userRole ?? "employee";

  const canApproveGrn = role === "store-manager" || role === "admin";
  const canApproveSrn =
    role === "store-manager" || role === "admin" || role === "department-head";

  const [tab, setTab] = useState<Tab>(canApproveGrn ? "grn" : "srn");
  const [grns, setGrns] = useState<Grn[]>([]);
  const [srns, setSrns] = useState<Srn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const [rejectTarget, setRejectTarget] = useState<{ kind: "grn" | "srn"; id: number; label: string } | null>(null);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [grnData, srnData] = await Promise.all([
        api.get<Grn[]>(ENDPOINTS.grn),
        api.get<Srn[]>(ENDPOINTS.srn),
      ]);
      setGrns(grnData);
      setSrns(srnData);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingGrns = useMemo(
    () => grns.filter((grn) => grn.status === "pending"),
    [grns]
  );
  const pendingSrns = useMemo(
    () => srns.filter((srn) => srn.status === "pending"),
    [srns]
  );

  const pendingGrnValue = useMemo(
    () =>
      pendingGrns.reduce(
        (sum, grn) => sum + Number(grn.total?.total_price ?? 0),
        0
      ),
    [pendingGrns]
  );

  const approve = async (kind: "grn" | "srn", id: number) => {
    const key = `${kind}-${id}`;
    setBusy((prev) => ({ ...prev, [key]: true }));
    try {
      await api.patch(`${kind === "grn" ? ENDPOINTS.grn : ENDPOINTS.srn}/${id}/approve`);
      toast.success(
        kind === "grn"
          ? `GRN #${id} approved — stock posted to the store.`
          : `Request #${id} approved.`
      );
      // Update local state instead of full reload to avoid navigation issues
      if (kind === "grn") {
        setGrns((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, status: "approved" } : g
          )
        );
      } else {
        setSrns((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: "approved" } : s
          )
        );
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const openReject = (kind: "grn" | "srn", id: number, label: string) => {
    setRejectTarget({ kind, id, label });
    setReason("");
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    if (reason.trim().length < 3) {
      toast.error("Please provide a reason (at least 3 characters).");
      return;
    }
    setRejecting(true);
    try {
      const base =
        rejectTarget.kind === "grn" ? ENDPOINTS.grn : ENDPOINTS.srn;
      await api.patch(`${base}/${rejectTarget.id}/reject`, {
        reason: reason.trim(),
      });
      toast.success(
        `${rejectTarget.kind === "grn" ? "GRN" : "Request"} #${rejectTarget.id} rejected.`
      );
      // Update local state instead of full reload
      if (rejectTarget.kind === "grn") {
        setGrns((prev) =>
          prev.map((g) =>
            g.id === rejectTarget.id ? { ...g, status: "rejected", rejection_reason: reason.trim() } : g
          )
        );
      } else {
        setSrns((prev) =>
          prev.map((s) =>
            s.id === rejectTarget.id ? { ...s, status: "rejected", rejection_reason: reason.trim() } : s
          )
        );
      }
      setRejectTarget(null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRejecting(false);
    }
  };

  const tabs = [
    ...(canApproveGrn
      ? [{ id: "grn" as Tab, label: "Goods received", count: pendingGrns.length }]
      : []),
    ...(canApproveSrn
      ? [{ id: "srn" as Tab, label: "Stock requests", count: pendingSrns.length }]
      : []),
  ];

  const noAccess = !canApproveGrn && !canApproveSrn;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals"
        description="Review goods received notes and employee stock requests waiting for a decision."
        icon={<FaClipboardCheck />}
        actions={
          <Button
            variant="secondary"
            icon={<FaCheckCircle />}
            onClick={() => void load()}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending GRNs"
          value={pendingGrns.length}
          hint={currency(pendingGrnValue)}
          icon={<FaBoxOpen />}
          tone={pendingGrns.length ? "amber" : "green"}
        />
        <StatCard
          label="Pending requests"
          value={pendingSrns.length}
          hint="Waiting for department approval"
          icon={<FaClipboardCheck />}
          tone={pendingSrns.length ? "amber" : "green"}
        />
        <StatCard
          label="Total needing action"
          value={pendingGrns.length + pendingSrns.length}
          hint="Across both workflows"
          icon={<FaFileInvoice />}
          tone={pendingGrns.length + pendingSrns.length ? "blue" : "green"}
        />
      </div>

      {noAccess ? (
        <Card>
          <EmptyState
            icon={<FaClipboardCheck />}
            title="Nothing to approve"
            description="Your role does not have approval permissions."
          />
        </Card>
      ) : (
        <Card padded={false}>
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <Tabs tabs={tabs} value={tab} onChange={setTab} />
          </div>

          {loading && grns.length === 0 && srns.length === 0 ? (
            <LoadingBlock label="Loading approvals…" />
          ) : tab === "grn" ? (
            pendingGrns.length === 0 ? (
              <EmptyState
                icon={<FaCheckCircle />}
                title="No goods awaiting approval"
                description="New goods received notes will appear here for the store manager to post."
                action={
                  <Link to="/dashboard/list-view">
                    <Button variant="secondary" icon={<FaEye />}>
                      View all GRNs
                    </Button>
                  </Link>
                }
              />
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th>GRN</Th>
                      <Th>Supplier</Th>
                      <Th>Items</Th>
                      <Th className="text-right">Value</Th>
                      <Th>Received</Th>
                      <Th>Status</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingGrns.map((grn) => (
                      <Tr key={grn.id}>
                        <Td>
                          <Link
                            to={`/dashboard/grn-details/${grn.id}`}
                            className="font-medium text-blue-600 hover:underline dark:text-blue-400 transition-colors"
                          >
                            GRN #{grn.id}
                          </Link>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {grn.suppliers_inv_other_no || "No invoice no."}
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <FaTruck className="text-xs text-slate-400" />
                            {grn.vendor?.name ?? grn.supplier}
                          </div>
                        </Td>
                        <Td className="text-sm text-slate-600 dark:text-slate-300">
                          {grn.grn_items?.length ?? 0} line
                          {(grn.grn_items?.length ?? 0) === 1 ? "" : "s"}
                        </Td>
                        <Td className="text-right font-semibold">
                          {currency(grn.total?.total_price)}
                        </Td>
                        <Td className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(grn.date)}
                        </Td>
                        <Td>
                          <Badge tone={statusTone(grn.status)} className="text-xs">
                            {statusLabel(grn.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="danger"
                              icon={<FaTimes />}
                              onClick={() => openReject("grn", grn.id, `GRN #${grn.id}`)}
                              className="transition-colors hover:bg-red-50/20 dark:hover:bg-red-500/20"
                              title="Reject GRN"
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="success"
                              icon={<FaCheck />}
                              loading={busy["grn-" + grn.id] ?? false}
                              onClick={() => void approve("grn", grn.id)}
                              className="transition-colors"
                              title="Approve GRN"
                            >
                              Approve
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )
          ) : pendingSrns.length === 0 ? (
            <EmptyState
              icon={<FaCheckCircle />}
              title="No pending requests"
              description="Employee requisitions will appear here for approval."
            />
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Request</Th>
                    <Th>Requested by</Th>
                    <Th>Work unit</Th>
                    <Th>Items</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSrns.map((srn) => (
                    <Tr key={srn.id}>
                      <Td>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">
                          SRN #{srn.id}
                        </span>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-700 dark:text-slate-300 transition-colors">
                          {srn.requested_by?.full_name ?? "—"}
                        </div>
                        {srn.requested_by?.department?.department_name && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 transition-colors">
                            {srn.requested_by.department.department_name}
                          </div>
                        )}
                      </Td>
                      <Td className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        {srn.requisition_work_unit || "—"}
                      </Td>
                      <Td className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                        {srn._count?.srn_items ?? srn.srn_items?.length ?? 0}
                      </Td>
                      <Td className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                        {formatDate(srn.date)}
                      </Td>
                      <Td>
                        <Badge tone={statusTone(srn.status)} className="text-xs">
                          {statusLabel(srn.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            icon={<FaTimes />}
                            onClick={() => openReject("srn", srn.id, `SRN #${srn.id}`)}
                            className="transition-colors hover:bg-red-50/20 dark:hover:bg-red-500/20"
                            title="Reject request"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="success"
                            icon={<FaCheck />}
                            loading={busy["srn-" + srn.id] ?? false}
                            onClick={() => void approve("srn", srn.id)}
                            className="transition-colors"
                            title="Approve request"
                          >
                            Approve
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </Card>
      )}

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={`Reject ${rejectTarget?.label ?? ""}`}
        description="The requester will be notified with your reason."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void submitReject()}
              loading={rejecting}
            >
              Reject
            </Button>
          </>
        }
      >
        <Field label="Reason" required>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this is being rejected…"
          />
        </Field>
      </Modal>
    </div>
  );
};

export default Approvals;
