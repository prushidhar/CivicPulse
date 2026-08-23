$content = Get-Content citizen-dashboard/src/app/track/page.tsx -Raw
$newSteps = "const getSteps = (status: string | undefined) => {
    let s = 'pending';
    if (status) s = status.toLowerCase();
    
    // Default: pending
    let states = ['completed', 'completed', 'completed', 'current', 'upcoming', 'upcoming', 'upcoming'];
    
    if (s === 'accepted') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming'];
    } else if (s === 'in_progress') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming'];
    } else if (s === 'resolved') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'];
    } else if (s === 'rejected') {
      states = ['completed', 'completed', 'completed', 'completed', 'completed', 'upcoming', 'upcoming'];
    }
    
    return [
      { label: 'Submitted', status: states[0] },
      { label: 'AI Analysis', status: states[1] },
      { label: 'Location Verified', status: states[2] },
      { label: 'Government Review', status: states[3] },
      { label: s === 'rejected' ? 'Decision (Rejected)' : 'Decision', status: states[4] },
      { label: 'Implementation', status: states[5] },
      { label: 'Completed', status: states[6] },
    ];
  };

  const steps = getSteps(trackData?.status);
"

$content = $content -replace "(?s)const steps = \[`n.*?\];", $newSteps
Set-Content citizen-dashboard/src/app/track/page.tsx -Value $content

