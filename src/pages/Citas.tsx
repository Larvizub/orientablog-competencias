import React, { useEffect, useState } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Orientador = { uid: string; nombre: string; apellido?: string; email?: string };
type Cita = {
  id?: string;
  usuarioUid: string;
  usuarioNombre: string;
  orientadorUid: string;
  orientadorNombre: string;
  fecha: string; // ISO date
  hora: string; // HH:MM
  motivo: string;
  estado?: string;
};

export default function Citas() {
  const { currentUser, userProfile } = useAuth();
  const [orientadores, setOrientadores] = useState<Orientador[]>([]);
  const [orientador, setOrientador] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('09:00');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [citas, setCitas] = useState<Cita[]>([]);
  // calendar state
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth()); // 0-11

  useEffect(() => {
    // cargar orientadores desde usuarios con isOrientador === true
    const usuariosRef = ref(database, 'usuarios');
    const unsub = onValue(usuariosRef, (snap) => {
      const val = snap.val() as Record<string, Record<string, unknown>> | null;
      const list: Orientador[] = [];
      if (!val) {
        setOrientadores([]);
        return;
      }
      for (const [uid, profile] of Object.entries(val)) {
        const p = profile as Record<string, unknown>;
        const isOrientador = Boolean(p['isOrientador']);
        if (isOrientador) {
          list.push({ uid, nombre: String(p['nombre'] ?? ''), apellido: String(p['apellido'] ?? ''), email: String(p['email'] ?? '') });
        }
      }
      // set list and only set default orientador if one is not already selected
      setOrientadores(list);
      setOrientador(prev => prev || (list[0]?.uid ?? ''));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    // subscribir a citas y filtrar para el usuario actual o orientador
    const citasRef = ref(database, 'citas');
  const unsub = onValue(citasRef, (snap) => {
      const val = snap.val() as Record<string, Record<string, unknown>> | null;
      if (!val) {
        setCitas([]);
        return;
      }
      const arr: Cita[] = Object.entries(val).map(([id, obj]) => {
        const o = obj as Record<string, unknown>;
        return {
          id,
          usuarioUid: String(o['usuarioUid'] ?? ''),
          usuarioNombre: String(o['usuarioNombre'] ?? ''),
          orientadorUid: String(o['orientadorUid'] ?? ''),
          orientadorNombre: String(o['orientadorNombre'] ?? ''),
          fecha: String(o['fecha'] ?? ''),
          hora: String(o['hora'] ?? ''),
          motivo: String(o['motivo'] ?? ''),
          estado: String(o['estado'] ?? 'pendiente')
        } as Cita;
      });
      if (userProfile && userProfile.isAdmin) {
        setCitas(arr);
        return;
      }
      // si es orientador mostrar citas asignadas a él, si es usuario mostrar las suyas
      const isOrientador = Boolean((userProfile as unknown as Record<string, unknown>)['isOrientador']);
      if (isOrientador && userProfile) {
        setCitas(arr.filter(c => c.orientadorUid === userProfile.uid));
        return;
      }
      setCitas(arr.filter(c => c.usuarioUid === userProfile?.uid));
    });

    return () => unsub();
  }, [userProfile]);

  // helper: booked dates for the selected orientador (YYYY-MM-DD)
  const bookedDatesForOrientador = React.useMemo(() => {
    if (!orientador) return new Set<string>();
    return new Set(citas.filter(c => c.orientadorUid === orientador).map(c => c.fecha));
  }, [citas, orientador]);

  const formatISODate = (d: Date) => d.toISOString().slice(0, 10);

  // build calendar matrix (weeks) for viewMonth/viewYear
  const buildMonth = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const startDay = first.getDay(); // 0 (Sun) - 6
    const weeks: Array<Array<number | null>> = [];
    let week: Array<number | null> = Array(7).fill(null);
    let day = 1;
    // fill first week
    for (let i = startDay; i < 7; i++) {
      week[i] = day++;
    }
    weeks.push(week.slice());
    while (day <= daysInMonth) {
      week = Array(7).fill(null);
      for (let i = 0; i < 7 && day <= daysInMonth; i++) {
        week[i] = day++;
      }
      weeks.push(week.slice());
    }
    return weeks;
  };

  const weeks = buildMonth(viewYear, viewMonth);

  const onSelectDay = (dayNum: number | null) => {
    if (!dayNum) return;
    const d = new Date(viewYear, viewMonth, dayNum);
    const iso = formatISODate(d);
    // if selected date is booked for this orientador, prevent and show error
    if (bookedDatesForOrientador.has(iso)) {
      setError('La fecha seleccionada ya tiene una cita con este orientador');
      return;
    }
    setError('');
    setFecha(iso);
  };


  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!currentUser || !userProfile) {
      setError('Debes iniciar sesión para agendar una cita');
      return;
    }
    if (!orientador) {
      setError('Selecciona un orientador');
      return;
    }
    if (!fecha || !hora) {
      setError('Selecciona fecha y hora');
      return;
    }

    try {
      setLoading(true);
      const orientadorProfile = orientadores.find(o => o.uid === orientador);
      const citasRef = ref(database, 'citas');
      await push(citasRef, {
        usuarioUid: userProfile.uid,
        usuarioNombre: `${userProfile.nombre ?? ''} ${userProfile.apellido ?? ''}`.trim(),
        orientadorUid: orientador,
        orientadorNombre: `${orientadorProfile?.nombre ?? ''} ${orientadorProfile?.apellido ?? ''}`.trim(),
        fecha,
        hora,
        motivo,
        estado: 'pendiente'
      });

      setFecha('');
      setHora('09:00');
      setMotivo('');
    } catch (err) {
      console.error(err);
      setError('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agendar Cita</h1>
      </div>

      {/* Calendario compacto */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-1 rounded-md hover:bg-muted/60 transition"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear(viewYear - 1);
                  } else {
                    setViewMonth(viewMonth - 1);
                  }
                }}
                aria-label="Mes anterior"
              >
                <span className="text-sm">◀</span>
              </button>
              <div className="text-base font-semibold">{new Date(viewYear, viewMonth).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <button
                type="button"
                className="p-1 rounded-md hover:bg-muted/60 transition"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear(viewYear + 1);
                  } else {
                    setViewMonth(viewMonth + 1);
                  }
                }}
                aria-label="Mes siguiente"
              >
                <span className="text-sm">▶</span>
              </button>
            </div>
            <div className="text-sm text-muted-foreground">Fechas ocupadas • <span className="inline-block w-3 h-3 bg-red-200 rounded-full align-middle ml-2 mr-1" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['D','L','M','M','J','V','S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm mt-2">
            {weeks.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((day, di) => {
                  const iso = day ? formatISODate(new Date(viewYear, viewMonth, day)) : '';
                  const isBooked = day ? bookedDatesForOrientador.has(iso) : false;
                  const isSelected = day ? fecha === iso : false;
                  const isToday = day ? formatISODate(new Date()) === iso : false;
                  return (
                    <button
                      key={di}
                      onClick={() => onSelectDay(day)}
                      className={`h-10 w-full rounded-md transition flex items-center justify-center ${!day ? 'opacity-0 pointer-events-none' : 'hover:bg-muted/80'} ${isBooked ? 'bg-red-100 text-red-800' : 'bg-background'} ${isSelected ? 'ring-2 ring-primary' : ''} ${isToday && !isSelected ? 'border border-primary/40' : ''}`}
                      disabled={!day}
                      aria-pressed={isSelected}
                      title={iso}
                    >
                      <span className={`text-sm ${isBooked ? 'font-semibold' : ''}`}>{day ?? ''}</span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded-full" /> ocupado</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-background rounded-full border" /> disponible</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-transparent rounded-full border border-primary" /> hoy</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear cita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <Label htmlFor="orientador">Orientador</Label>
              <select id="orientador" value={orientador} onChange={(e) => setOrientador(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {orientadores.map(o => (
                  <option key={o.uid} value={o.uid}>{o.nombre} {o.apellido}</option>
                ))}
                {orientadores.length === 0 && <option value="">No hay orientadores disponibles</option>}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea id="motivo" value={motivo} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMotivo(e.target.value)} rows={4} />
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <Button type="submit" disabled={loading}>{loading ? 'Agendando...' : 'Agendar'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus citas</CardTitle>
        </CardHeader>
        <CardContent>
          {citas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas registradas</p>
          ) : (
            <ul className="space-y-3">
              {citas.map(c => (
                <li key={c.id} className="border p-3 rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{c.orientadorNombre}</p>
                      <p className="text-sm text-muted-foreground">{c.fecha} {c.hora}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Estado: {c.estado}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">{c.motivo}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
