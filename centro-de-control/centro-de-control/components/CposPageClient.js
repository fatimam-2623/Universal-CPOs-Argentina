'use client';

import { useState, useMemo } from 'react';
import CpoOverview from './CpoOverview';
import CpoTable from './CpoTable';

export default function CposPageClient({ profile, provincias, workers, records }) {
  const [provinciaFilter, setProvinciaFilter] = useState('all');

  const filteredWorkers = useMemo(() => {
    if (provinciaFilter === 'all') return workers;
    return workers.filter((w) => w.provincia_id === provinciaFilter);
  }, [workers, provinciaFilter]);

  return (
    <div className="space-y-8">
      <CpoOverview
        profile={profile}
        provincias={provincias}
        workers={workers}
        records={records}
        activeFilter={provinciaFilter}
        onFilterChange={setProvinciaFilter}
      />
      <CpoTable profile={profile} provincias={provincias} workers={filteredWorkers} records={records} />
    </div>
  );
}
