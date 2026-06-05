import { useMemo, useState } from "react";
import { Building2, Loader2, MapPin, Map, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  useDivisions,
  useCreateDivision,
  useUpdateDivision,
  useDeleteDivision,
  useStates,
  useCreateState,
  useUpdateState,
  useDeleteState,
  useCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
} from "@/hooks/use-locations";
import { type ApiDivision, type ApiState, type ApiCity } from "@/services/location.service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Division section ──────────────────────────────────────────────────────────

function DivisionSection() {
  const { data, isLoading } = useDivisions();
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiDivision | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const divisions = data?.data ?? [];
  const isSaving = createDivision.isPending || updateDivision.isPending;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return divisions;
    return divisions.filter((d) => d.name.toLowerCase().includes(term));
  }, [divisions, search]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDialogOpen(true);
  }

  function openEdit(division: ApiDivision) {
    setEditing(division);
    setName(division.name);
    setDialogOpen(true);
  }

  function reset() {
    setDialogOpen(false);
    setEditing(null);
    setName("");
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Division name is required");
      return;
    }
    if (editing) {
      await updateDivision.mutateAsync({ id: editing._id, payload: { name: name.trim() } });
    } else {
      await createDivision.mutateAsync({ name: name.trim() });
    }
    reset();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100">
              <Building2 className="h-4 w-4 text-amber-600" />
            </div>
            Divisions
            <Badge variant="secondary" className="ml-1">{divisions.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search divisions…"
                className="h-8 pl-8 text-sm w-44"
              />
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Division
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? "No matching divisions" : "No divisions yet"}
            description={search ? "Try a different search term." : "Add your first division."}
            icon={<Building2 className="h-6 w-6 text-slate-400" />}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((division) => (
              <div key={division._id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
                    <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{division.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-slate-600"
                    title="Edit division"
                    onClick={() => openEdit(division)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-red-500"
                    title="Delete division"
                    onClick={() => setDeleteId(division._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : reset())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Division" : "New Division"}</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="mb-1.5 block">Division Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dhaka"
              onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this division?"
        description="This will permanently remove the division."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteDivision.isPending}
        onConfirm={() => {
          if (deleteId) deleteDivision.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </Card>
  );
}

// ─── State section ──────────────────────────────────────────────────────────

function StateSection() {
  const { data, isLoading } = useStates();
  const createState = useCreateState();
  const updateState = useUpdateState();
  const deleteState = useDeleteState();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiState | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const states = data?.data ?? [];
  const isSaving = createState.isPending || updateState.isPending;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return states;
    return states.filter((d) => d.name.toLowerCase().includes(term));
  }, [states, search]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDialogOpen(true);
  }

  function openEdit(state: ApiState) {
    setEditing(state);
    setName(state.name);
    setDialogOpen(true);
  }

  function reset() {
    setDialogOpen(false);
    setEditing(null);
    setName("");
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("State name is required");
      return;
    }
    if (editing) {
      await updateState.mutateAsync({ id: editing._id, payload: { name: name.trim() } });
    } else {
      await createState.mutateAsync({ name: name.trim() });
    }
    reset();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-100">
              <Map className="h-4 w-4 text-green-600" />
            </div>
            States
            <Badge variant="secondary" className="ml-1">{states.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search states…"
                className="h-8 pl-8 text-sm w-44"
              />
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add State
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? "No matching states" : "No states yet"}
            description={search ? "Try a different search term." : "Add your first state."}
            icon={<Map className="h-6 w-6 text-slate-400" />}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((state) => (
              <div key={state._id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
                    <Map className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">{state.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-slate-600"
                    title="Edit state"
                    onClick={() => openEdit(state)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-red-500"
                    title="Delete state"
                    onClick={() => setDeleteId(state._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : reset())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit State" : "New State"}</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="mb-1.5 block">State Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. California"
              onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this state?"
        description="This will permanently remove the state."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteState.isPending}
        onConfirm={() => {
          if (deleteId) deleteState.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </Card>
  );
}

// ─── City section ──────────────────────────────────────────────────────────────

function CitySection() {
  const { data: stateData } = useStates();
  const { data, isLoading } = useCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCity | null>(null);
  const [form, setForm] = useState({ name: "", state: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const states = stateData?.data ?? [];
  const cities = data?.data ?? [];
  const isSaving = createCity.isPending || updateCity.isPending;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        getStateName(c.state, states).toLowerCase().includes(term),
    );
  }, [cities, search, states]);

  function getStateName(stateVal: ApiCity['state'], statesList: typeof states) {
    if (typeof stateVal === 'object' && stateVal !== null) return stateVal.name;
    return statesList.find((s) => s._id === stateVal)?.name ?? stateVal;
  }

  function getStateId(stateVal: ApiCity['state']) {
    if (typeof stateVal === 'object' && stateVal !== null) return stateVal._id;
    return stateVal;
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", state: states[0]?._id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(city: ApiCity) {
    setEditing(city);
    setForm({ name: city.name, state: getStateId(city.state) });
    setDialogOpen(true);
  }

  function reset() {
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: "", state: "" });
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("City name is required");
      return;
    }
    if (!form.state.trim()) {
      toast.error("Please select a state");
      return;
    }
    const payload = { name: form.name.trim(), state: form.state.trim() };
    if (editing) {
      await updateCity.mutateAsync({ id: editing._id, payload });
    } else {
      await createCity.mutateAsync(payload);
    }
    reset();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            Cities
            <Badge variant="secondary" className="ml-1">{cities.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities…"
                className="h-8 pl-8 text-sm w-44"
              />
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add City
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? "No matching cities" : "No cities yet"}
            description={search ? "Try a different search term." : "Add your first city."}
            icon={<MapPin className="h-6 w-6 text-slate-400" />}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((city) => (
              <div key={city._id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{city.name}</p>
                    <p className="text-xs text-slate-400">{getStateName(city.state, states)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-slate-600"
                    title="Edit city"
                    onClick={() => openEdit(city)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-400 hover:text-red-500"
                    title="Delete city"
                    onClick={() => setDeleteId(city._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : reset())}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit City" : "New City"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block">City Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. San Francisco"
                onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">State *</Label>
              {states.length === 0 ? (
                <p className="text-xs text-slate-500">No states available. Create a state first.</p>
              ) : (
                <select
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select state…</option>
                  {states.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={reset}>Cancel</Button>
            <Button onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this city?"
        description="This will permanently remove the city."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteCity.isPending}
        onConfirm={() => {
          if (deleteId) deleteCity.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </Card>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  const { data: divData } = useDivisions();
  const { data: stateData } = useStates();
  const { data: cityData } = useCities();

  const divisionCount = divData?.data?.length ?? 0;
  const stateCount = stateData?.data?.length ?? 0;
  const cityCount = cityData?.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description={`${divisionCount} divisions · ${stateCount} states · ${cityCount} cities`}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <DivisionSection />
        <StateSection />
        <CitySection />
      </div>
    </div>
  );
}
