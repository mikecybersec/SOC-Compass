import React from 'react';

const Sidebar = ({ aspects, currentKey, onSelect }) => {
  const grouped = aspects.reduce((acc, item) => {
    acc[item.domain] = acc[item.domain] || [];
    acc[item.domain].push(item);
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      <h3>SOC Domains</h3>
      {Object.entries(grouped).map(([domain, domainAspects]) => (
        <div key={domain} style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 700 }}>{domain}</p>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
            {domainAspects.map((aspect) => {
              const key = `${aspect.domain}::${aspect.aspect}`;
              const active = key === currentKey;
              return (
                <button
                  key={key}
                  className={active ? 'primary' : 'secondary'}
                  onClick={() => onSelect(key)}
                  style={{ textAlign: 'left' }}
                >
                  {aspect.aspect}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
