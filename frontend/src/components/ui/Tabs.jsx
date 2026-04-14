import { useState } from 'react'
import { clsx } from 'clsx'

export default function Tabs({ tabs = [], defaultTab, className }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  return (
    <div className={clsx('w-full', className)}>
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium transition-colors relative -mb-px',
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        className="pt-4"
      >
        {activeContent}
      </div>
    </div>
  )
}
