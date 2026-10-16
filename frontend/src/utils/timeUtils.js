// Indian Standard Time (IST) formatting utility for Restaurant Orders & Reports

export function formatOrderTime(rawDate) {
  if (!rawDate) {
    return {
      timeStr: '--:--',
      dateStr: '',
      relativeStr: '',
      fullDisplay: '--:--'
    };
  }

  try {
    let dateObj;
    if (Array.isArray(rawDate)) {
      // Jackson date array: [year, month, day, hour, minute, second]
      dateObj = new Date(
        rawDate[0],
        (rawDate[1] || 1) - 1,
        rawDate[2] || 1,
        rawDate[3] || 0,
        rawDate[4] || 0,
        rawDate[5] || 0
      );
    } else if (typeof rawDate === 'number') {
      dateObj = new Date(rawDate);
    } else if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim();
      // If ISO format without timezone offset (e.g. Render UTC output "2026-10-16T13:08:18")
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
        if (!trimmed.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(trimmed)) {
          // Append Z so browser knows it's UTC and converts to local Indian Standard Time (+05:30)
          dateObj = new Date(trimmed + 'Z');
        } else {
          dateObj = new Date(trimmed);
        }
      } else {
        dateObj = new Date(trimmed);
      }
    } else {
      dateObj = new Date(rawDate);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return {
        timeStr: String(rawDate),
        dateStr: '',
        relativeStr: '',
        fullDisplay: String(rawDate)
      };
    }

    // 12-Hour format with AM/PM (e.g. "06:38 PM")
    const timeStr = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Date (e.g. "16 Oct")
    const dateStr = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });

    // Relative elapsed time
    const nowMs = Date.now();
    const diffMs = Math.max(0, nowMs - dateObj.getTime());
    const diffMins = Math.floor(diffMs / 60000);

    let relativeStr = 'Abhi-abhi (Just now)';
    if (diffMins >= 1 && diffMins < 60) {
      relativeStr = `${diffMins} min pehle`;
    } else if (diffMins >= 60 && diffMins < 1440) {
      const diffHours = Math.floor(diffMins / 60);
      relativeStr = `${diffHours} hr pehle`;
    } else if (diffMins >= 1440) {
      relativeStr = dateStr;
    }

    return {
      timeStr,
      dateStr,
      relativeStr,
      fullDisplay: `${timeStr} (${relativeStr})`
    };
  } catch (err) {
    return {
      timeStr: '--:--',
      dateStr: '',
      relativeStr: '',
      fullDisplay: '--:--'
    };
  }
}
