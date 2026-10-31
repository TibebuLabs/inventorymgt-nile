import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaEdit,
  FaEnvelope,
  FaExclamationTriangle,
  FaPhone,
  FaPlus,
  FaSearch,
  FaTimesCircle,
  FaTrashAlt,
  FaTruck,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { api, query } from "../../services/api";
import {
  ENDPOINTS,
  type Vendor,
  type VendorPayload,
} from "../../services/endpoints";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Table,
  TableWrap,
  Td,
  Textarea,
  Th,
  Tr,
  useToast,
} from "../../components/ui";
import { errorMessage, formatDate } from "../../lib/format";

type FormState = {
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  notes: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  tax_id: "",
  notes: "",
  is_active: true,
};

const Vendors = () => {
  const { user } = useAuth();
  const toast = useToast();
  const role = user?.userRole ?? "employee";
  const canDelete = role === "admin" || role === "store-manager";

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Vendor[]>(
        `${ENDPOINTS.vendors}${query({ search })}`
      );
      setVendors(data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const stats = useMemo(() => {
    const active = vendors.filter((vendor) => vendor.is_active).length;
    const linked = vendors.reduce(
      (sum, vendor) => sum + (vendor._count?.grns ?? 0),
      0
    );
    return { active, inactive: vendors.length - active, linked };
  }, [vendors]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditing(vendor);
    setForm({
      name: vendor.name ?? "",
      contact_name: vendor.contact_name ?? "",
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      address: vendor.address ?? "",
      tax_id: vendor.tax_id ?? "",
      notes: vendor.notes ?? "",
      is_active: vendor.is_active ?? true,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (form.name.trim().length < 2) {
      toast.error("Vendor name must be at least 2 characters.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    const payload: VendorPayload = {
      name: form.name.trim(),
      is_active: form.is_active,
    };
    if (form.contact_name.trim()) payload.contact_name = form.contact_name.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.tax_id.trim()) payload.tax_id = form.tax_id.trim();
    if (form.notes.trim()) payload.notes = form.notes.trim();

    setSaving(true);
    try {
      if (editing) {
        await api.put(`${ENDPOINTS.vendors}/${editing.id}`, payload);
        toast.success("Vendor updated.");
      } else {
        await api.post(ENDPOINTS.vendors, payload);
        toast.success("Vendor added.");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`${ENDPOINTS.vendors}/${deleteTarget.id}`);
      toast.success(
        deleteTarget._count?.grns
          ? "Vendor deactivated because it is linked to goods received notes."
          : "Vendor removed."
      );
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Master list of suppliers used when receiving goods into the store."
        icon={<FaTruck />}
        actions={
          <Button icon={<FaPlus />} onClick={openCreate}>
            Add vendor
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total vendors
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {vendors.length}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Active
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.active}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Goods received
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.linked}
          </p>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
            Supplier directory
          </h2>
          <div className="relative sm:w-64">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, contact or email"
              className="pl-8"
            />
          </div>
        </div>

        {loading && vendors.length === 0 ? (
          <LoadingBlock label="Loading vendors…" />
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={<FaTruck />}
            title="No vendors yet"
            description="Add your first supplier so it can be selected on goods received notes."
            action={<Button icon={<FaPlus />} onClick={openCreate}>Add vendor</Button>}
          />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Vendor</Th>
                  <Th>Contact</Th>
                  <Th>Tax ID</Th>
                  <Th className="text-center">GRNs</Th>
                  <Th>Status</Th>
                  <Th>Added</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <Tr key={vendor.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                          <FaBuilding />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {vendor.name}
                          </div>
                          {vendor.address && (
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {vendor.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {vendor.contact_name || "—"}
                      </div>
                      <div className="flex flex-wrap gap-x-3 text-xs text-slate-400 dark:text-slate-500">
                        {vendor.email && (
                          <span className="inline-flex items-center gap-1">
                            <FaEnvelope /> {vendor.email}
                          </span>
                        )}
                        {vendor.phone && (
                          <span className="inline-flex items-center gap-1">
                            <FaPhone /> {vendor.phone}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td className="text-slate-500 dark:text-slate-400">
                      {vendor.tax_id || "—"}
                    </Td>
                    <Td className="text-center">
                      <Badge tone={(vendor._count?.grns ?? 0) > 0 ? "blue" : "slate"}>
                        {vendor._count?.grns ?? 0}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={vendor.is_active ? "green" : "slate"} dot>
                        {vendor.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(vendor.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<FaEdit />}
                          onClick={() => openEdit(vendor)}
                        >
                          Edit
                        </Button>
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<FaTrashAlt />}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(vendor)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit vendor" : "Add vendor"}
        description="Suppliers appear in the GRN form once saved."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} loading={saving}>
              {editing ? "Save changes" : "Add vendor"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vendor name" required className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder="e.g. Ethiopian Office Supplies PLC"
            />
          </Field>
          <Field label="Contact person">
            <Input
              value={form.contact_name}
              onChange={(event) =>
                setForm((f) => ({ ...f, contact_name: event.target.value }))
              }
              placeholder="Full name"
            />
          </Field>
          <Field label="Tax ID / TIN">
            <Input
              value={form.tax_id}
              onChange={(event) => setForm((f) => ({ ...f, tax_id: event.target.value }))}
              placeholder="TIN 0001234567"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
              placeholder="sales@supplier.et"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
              placeholder="+251 911 234 567"
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input
              value={form.address}
              onChange={(event) => setForm((f) => ({ ...f, address: event.target.value }))}
              placeholder="Bole, Addis Ababa"
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea
              value={form.notes}
              onChange={(event) => setForm((f) => ({ ...f, notes: event.target.value }))}
              placeholder="Payment terms, delivery lead time, etc."
            />
          </Field>
          <Field label="Status" className="sm:col-span-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm dark:border-slate-600">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((f) => ({ ...f, is_active: event.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Active — available for selection on new GRNs
              </span>
            </label>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove vendor"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<FaTimesCircle />}
              onClick={() => void confirmDelete()}
              loading={deleting}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {deleteTarget?._count?.grns
            ? `${deleteTarget.name} is linked to ${deleteTarget._count.grns} goods received note(s). It will be deactivated instead of deleted so history stays intact.`
            : `Remove ${deleteTarget?.name ?? "this vendor"} from the supplier directory?`}
        </p>
      </Modal>
    </div>
  );
};

export default Vendors;
