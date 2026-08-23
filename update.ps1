$content = Get-Content government-dashboard/src/pages/CitizenRequests.tsx -Raw
$content = $content -replace "(?s)const fetchRequests = \(\) => \{", "const handleStatusChange = async (id: string, newStatus: string) => {`n    try {`n      await api.updateRequestStatus(id, newStatus);`n      fetchRequests();`n    } catch (err) {`n      console.error('Failed to update status', err);`n    }`n  };`n`n  const fetchRequests = () => {"

$content = $content -replace "(?s)<span className=`"text-muted-foreground text-xs uppercase`">\{r.status \|\| 'Pending'\}</span>", "<select value={r.status || 'pending'} onChange={(e) => handleStatusChange(r.request_id, e.target.value)} className=`"bg-background border border-border rounded text-xs p-1 cursor-pointer`"><option value=`"pending`">PENDING</option><option value=`"accepted`">ACCEPTED</option><option value=`"in_progress`">IN PROGRESS</option><option value=`"resolved`">RESOLVED</option><option value=`"rejected`">REJECTED</option></select>"

Set-Content government-dashboard/src/pages/CitizenRequests.tsx -Value $content

