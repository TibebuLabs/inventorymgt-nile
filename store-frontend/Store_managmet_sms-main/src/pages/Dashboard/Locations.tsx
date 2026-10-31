import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArchive, FaBox, FaEdit, FaExclamationTriangle, FaMapPin, FaPlus, FaSearch, FaTrashAlt } from "react-icons/fa";
import { api, query } from "../../services/api";
import { ENDPOINTS, type InventoryLocation, type LocationPayload } from "../../services/endpoints";
import { Badge, Button, Card, EmptyState, Field, Input, LoadingBlock, Modal, PageHeader, Table, TableWrap, Td, Th, Tr, useToast } from "../../components/ui";
import { errorMessage, formatDate } from "../../lib/format";

type FormState = {
  name: string;
  aisle: string;
  shelf: string;
  bin: string;
  category: string;
  description: string;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  aisle: "",
  shelf: "",
  bin: "",
  category: "",
  description: "",
  is_active: true,
};

const Locations = () => {
  const toast = useToast();
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryLocation | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<InventoryLocation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<InventoryLocation[]>(
        `${ENDPOINTS.locations}${query({ search })}`
      );
      setLocations(data);
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
    const active = locations.filter((l) => l.is_active).length;
    const totalItems = locations.reduce((sum, l) => sum + (l._count?.items ?? 0), 0);
    const categories = new Set(locations.map((l) => l.category).filter(Boolean));
    return { active, inactive: locations.length - active, totalItems, categories: categories.size };
  }, [locations]);

  const fullPath = (loc: InventoryLocation) =>
    [loc.aisle, loc.shelf, loc.bin].filter(Boolean).join("-") || "—";

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (loc: InventoryLocation) => {
    setEditing(loc);
    setForm({
      name: loc.name ?? "",
      aisle: loc.aisle ?? "",
      shelf: loc.shelf ?? "",
      bin: loc.bin ?? "",
      category: loc.category ?? "",
      description: loc.description ?? "",
      is_active: loc.is_active ?? true,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    if (form.name.trim().length < 2) {
      toast.error("Location name must be at least 2 characters.");
      return;
    }

    const payload: LocationPayload = {
      name: form.name.trim(),
      is_active: form.is_active,
    };
    if (form.aisle.trim()) payload.aisle = form.aisle.trim();
    if (form.shelf.trim()) payload.shelf = form.shelf.trim();
    if (form.bin.trim()) payload.bin = form.bin.trim();
    if (form.category.trim()) payload.category = form.category.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    setSaving(true);
    try {
      if (editing) {
        await api.put(`${ENDPOINTS.locations}/${editing.id}`, payload);
        toast.success("Location updated.");
      } else {
        await api.post(ENDPOINTS.locations, payload);
        toast.success("Location added.");
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
      await api.delete(`${ENDPOINTS.locations}/${deleteTarget.id}`);
      toast.success(
        deleteTarget._count?.items
          ? `Location deactivated (linked to ${deleteTarget._count.items} item(s)).`
          : "Location removed."
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
        title="Storage Locations"
        description="Map physical warehouse locations (aisle, shelf, bin) to items so store keepers can find stock instantly."
        icon={<FaMapPin />}
        actions={
          <Button icon={<FaPlus />} onClick={openCreate}>
            Add location
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total locations</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{locations.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categories</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.categories}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Items stored</p>
          <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.totalItems}</p>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <FaExclamationTriangle />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Location directory</h2>
          <div className="relative sm:w-64">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, aisle, shelf, bin, category"
              className="pl-8"
            />
          </div>
        </div>

        {loading && locations.length === 0 ? (
          <LoadingBlock label="Loading locations…" />
        ) : locations.length === 0 ? (
          <EmptyState
            icon={<FaArchive />}
            title="No locations yet"
            description="Add your first storage location so items can be mapped to physical places in the warehouse."
            action={<Button icon={<FaPlus />} onClick={openCreate}>Add location</Button>}
          />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Location</Th>
                  <Th className="text-center">Aisle</Th>
                  <Th className="text-center">Shelf</Th>
                  <Th className="text-center">Bin</Th>
                  <Th>Category</Th>
                  <Th className="text-center">Items</Th>
                  <Th>Status</Th>
                  <Th>Added</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <Tr key={loc.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                          <FaBox className="text-xs" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-100">{loc.name}</div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">{fullPath(loc)}</div>
                          {loc.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 italic">{loc.description}</div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-center text-slate-600 dark:text-slate-300">{loc.aisle || "—"}</Td>
                    <Td className="text-center text-slate-600 dark:text-slate-300">{loc.shelf || "—"}</Td>
                    <Td className="text-center text-slate-600 dark:text-slate-300">{loc.bin || "—"}</Td>
                    <Td>
                      <Badge tone={loc.category ? "blue" : "slate"}>
                        {loc.category || "Uncategorized"}
                      </Badge>
                    </Td>
                    <Td className="text-center font-semibold">
                      <Badge tone={loc._count?.items ? "green" : "slate"}>
                        {loc._count?.items ?? 0}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge tone={loc.is_active ? "green" : "red"} dot>
                        {loc.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(loc.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<FaEdit />} onClick={() => openEdit(loc)}>Edit</Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<FaTrashAlt />}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(loc)}
                        >
                          Delete
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit location" : "Add storage location"}
        description="Define a physical place in the warehouse (aisle, shelf, bin) and optionally a category."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void submit()} loading={saving}>{editing ? "Save changes" : "Add location"}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Location name *" required className="sm:col-span-3">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Electronics Aisle"
            />
          </Field>
          <Field label="Aisle">
            <Input
              value={form.aisle}
              onChange={(e) => setForm((f) => ({ ...f, aisle: e.target.value }))}
              placeholder="A"
            />
          </Field>
          <Field label="Shelf">
            <Input
              value={form.shelf}
              onChange={(e) => setForm((f) => ({ ...f, shelf: e.target.value }))}
              placeholder="1"
            />
          </Field>
          <Field label="Bin">
            <Input
              value={form.bin}
              onChange={(e) => setForm((f) => ({ ...f, bin: e.target.value }))}
              placeholder="01"
            />
          </Field>
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Office Supplies"
            />
          </Field>
          <Field label="Description" className="sm:col-span-3">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Additional details about this location"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500 min-h-[80px] resize-y"
            />
          </Field>
          <Field label="Status" className="sm:col-span-3">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-600">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Active — available for item assignment</span>
            </label>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove location"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" icon={<FaTrashAlt />} onClick={() => void confirmDelete()} loading={deleting}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {deleteTarget?._count?.items
            ? `${deleteTarget.name} is linked to ${deleteTarget._count.items} item(s). It will be deactivated so item history stays intact.`
            : `Remove ${deleteTarget?.name ?? "this location"}?`}
        </p>
      </Modal>
    </div>
  );
};

export default Locations;
