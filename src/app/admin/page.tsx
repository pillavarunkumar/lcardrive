export default function AdminDashboard() {
  return (
    <>
      {/* High-level Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-sm border border-outline-variant flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-surface-container rounded-lg text-secondary">
              <span className="material-symbols-outlined">local_taxi</span>
            </div>
            <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm bg-secondary-container/30 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +12%
            </span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Instructors</p>
            <p className="font-display-lg text-display-lg text-on-surface">4,289</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-sm border border-outline-variant flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error-container text-error rounded-lg">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Pending Claims</p>
            <p className="font-display-lg text-display-lg text-on-surface">142</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-stack-md shadow-sm border border-outline-variant flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-fixed text-on-tertiary-container rounded-lg">
              <span className="material-symbols-outlined">reviews</span>
            </div>
            <span className="inline-flex items-center gap-1 text-on-tertiary-container font-label-sm text-label-sm bg-tertiary-fixed/50 px-2 py-1 rounded-full">New</span>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">New Reviews (24h)</p>
            <p className="font-display-lg text-display-lg text-on-surface">87</p>
          </div>
        </div>
      </section>

      {/* Bulk CSV Import */}
      <section>
        <div className="flex justify-between items-end mb-stack-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Seed Database</h2>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant hover:border-secondary hover:bg-surface-container-low transition-colors duration-200 p-stack-lg text-center flex flex-col items-center justify-center cursor-pointer group">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-4 group-hover:text-secondary group-hover:bg-secondary-container transition-colors">
            <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Bulk CSV Import</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-4">Drag and drop your instructor CSV file here to bulk import or update listings.</p>
          <button className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors">
            Browse Files
          </button>
        </div>
      </section>

      {/* Claims Queue Table */}
      <section>
        <div className="flex justify-between items-end mb-stack-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Claims Queue</h2>
          <a className="font-label-md text-label-md text-secondary hover:underline" href="#">View All</a>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant">Instructor Name</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant">ADI Number</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant">Date Submitted</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {[
                  { name: 'Sarah Jenkins', adi: 'ADI-847291', date: 'Oct 24, 2024' },
                  { name: 'David Chen', adi: 'ADI-392018', date: 'Oct 23, 2024' },
                ].map((claim) => (
                  <tr key={claim.name} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-body-md text-body-md text-on-surface font-medium">{claim.name}</td>
                    <td className="p-4 font-body-md text-body-md text-on-surface-variant">{claim.adi}</td>
                    <td className="p-4 font-body-md text-body-md text-on-surface-variant">{claim.date}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Reject">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                      <button className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Review Moderation Table */}
      <section className="pb-stack-lg">
        <div className="flex justify-between items-end mb-stack-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Review Moderation</h2>
          <a className="font-label-md text-label-md text-secondary hover:underline" href="#">View All</a>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant w-1/4">Reviewer</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant w-1/4">Instructor</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant w-1/3">Comment</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="p-4">
                    <div className="font-body-md text-body-md text-on-surface font-medium">Emma W.</div>
                    <div className="flex text-tertiary-fixed-dim text-[16px] mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant">Mike Thompson</td>
                  <td className="p-4 font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2">&quot;Mike was incredibly patient and helped me overcome my roundabout anxiety completely. Highly recommend!&quot;</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Delete">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                    <button className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve">
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
