// Settings page shown inside the Zepp phone app (Profile > device > Mneme).
// Values live in settingsStorage; the side service reads them on sync.

function clampInt(v, lo, hi, fallback) {
  const n = parseInt(v, 10)
  if (isNaN(n)) return fallback
  return Math.min(hi, Math.max(lo, n))
}

AppSettingsPage({
  build(props) {
    const storage = props.settingsStorage
    const get = (key, fallback) => {
      const v = storage.getItem(key)
      return v === undefined || v === null ? fallback : v
    }
    const set = (key, value) => storage.setItem(key, String(value))
    const resetArmed = get('resetProgress', 'false') === 'true'

    const heading = (text) =>
      Text(
        {
          bold: true,
          style: { display: 'block', fontSize: '15px', color: '#222', marginTop: '18px', marginBottom: '6px' }
        },
        text
      )
    const help = (text) =>
      Text({ style: { display: 'block', fontSize: '12px', color: '#777', marginBottom: '8px' } }, text)

    return View({ style: { padding: '12px 16px 24px' } }, [
      heading('Decks'),
      help(
        'Web addresses of deck files in Mneme JSON format, separated by spaces or commas. ' +
          'Then tap "Sync with phone" on the watch. The Greek starter decks are built in.'
      ),
      TextInput({
        label: 'Deck URLs',
        value: get('deckUrls', ''),
        placeholder: 'https://…/greek.json',
        onChange: (v) => set('deckUrls', v)
      }),

      heading('Study'),
      Toggle({
        label: 'Show the meaning first',
        value: get('reverse', 'false') === 'true',
        onChange: (v) => set('reverse', !!v)
      }),
      TextInput({
        label: 'New cards per day',
        value: get('newPerDay', '15'),
        onChange: (v) => set('newPerDay', clampInt(v, 0, 500, 15))
      }),
      TextInput({
        label: 'Keep the screen on for (seconds)',
        value: get('brightSeconds', '45'),
        onChange: (v) => set('brightSeconds', clampInt(v, 10, 600, 45))
      }),
      help('Study options reach the watch on the next sync, or at once while Mneme is open.'),

      heading('Danger zone'),
      Button({
        label: resetArmed ? 'Reset armed. Tap to cancel' : 'Reset all progress on next sync',
        style: {
          fontSize: '13px',
          borderRadius: '20px',
          background: resetArmed ? '#D85E33' : '#e5e5e5',
          color: resetArmed ? 'white' : '#222'
        },
        onClick: () => set('resetProgress', !resetArmed)
      })
    ])
  }
})
