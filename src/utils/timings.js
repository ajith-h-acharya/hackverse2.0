/**
 * Utility to calculate and format opening hours and open/closed status for Mangalore.nav nodes.
 */

// Custom specific timings for major places (real-world data)
const SPECIFIC_TIMINGS = {
  // Pilikula Zoo (ID 4) - Closed on Mondays!
  '4': {
    label: '9:30 AM - 5:30 PM',
    ranges: [{ open: 9.5, close: 17.5 }],
    closedDays: [1], // 1 = Monday
    holidayName: 'Monday Weekly Holiday'
  },
  // Sultan Battery (ID 5 / gem-1) - Ferry runs till 6 PM
  '5': {
    label: '9:00 AM - 6:00 PM',
    ranges: [{ open: 9.0, close: 18.0 }]
  },
  'gem-1': {
    label: '9:00 AM - 6:00 PM',
    ranges: [{ open: 9.0, close: 18.0 }]
  },
  // St. Aloysius Chapel (ID 3)
  '3': {
    label: '9:00 AM - 6:00 PM',
    ranges: [{ open: 9.0, close: 18.0 }],
    closedDays: [0], // Sunday timings can be different, or closed
  },
  // Giri Manja's (ID 17) - Famous seafood lunch spot
  '17': {
    label: '11:30 AM - 3:30 PM, 7:00 PM - 10:00 PM',
    ranges: [
      { open: 11.5, close: 15.5 },
      { open: 19.0, close: 22.0 }
    ]
  },
  // Machali (ID 9)
  '9': {
    label: '11:30 AM - 3:30 PM, 7:00 PM - 10:00 PM',
    ranges: [
      { open: 11.5, close: 15.5 },
      { open: 19.0, close: 22.0 }
    ]
  }
};

export function getPlaceTimings(place) {
  if (!place) return null;

  const id = String(place.id);
  const category = place.category || '';
  const type = place.type || '';

  // 1. Check specific timings
  if (SPECIFIC_TIMINGS[id]) {
    return resolveStatus(SPECIFIC_TIMINGS[id], place);
  }

  // 2. Hotels are open 24/7
  const isHotel = ['Luxury', 'Premium', 'Boutique', 'Resort', 'Eco-Resort'].includes(type) || category === 'Stays';
  if (isHotel) {
    return resolveStatus({
      label: 'Open 24 Hours',
      ranges: [{ open: 0, close: 24 }],
      is24Hours: true
    }, place);
  }

  // 3. Category fallbacks
  switch (category) {
    case 'Coastal':
      // Beaches: 6:00 AM - 7:30 PM (safety restrictions after dark)
      return resolveStatus({
        label: '6:00 AM - 7:30 PM',
        ranges: [{ open: 6.0, close: 19.5 }]
      }, place);

    case 'Religious':
      // Temples: 6:00 AM - 1:00 PM, 4:00 PM - 8:30 PM
      return resolveStatus({
        label: '6:00 AM - 1:00 PM, 4:00 PM - 8:30 PM',
        ranges: [
          { open: 6.0, close: 13.0 },
          { open: 16.0, close: 20.5 }
        ]
      }, place);

    case 'Heritage':
      // Museums/Chapels: 9:00 AM - 6:00 PM
      return resolveStatus({
        label: '9:00 AM - 6:00 PM',
        ranges: [{ open: 9.0, close: 18.0 }]
      }, place);

    case 'Nature':
      // Parks: 9:00 AM - 6:30 PM
      return resolveStatus({
        label: '9:00 AM - 6:30 PM',
        ranges: [{ open: 9.0, close: 18.5 }]
      }, place);

    case 'Culinary':
      // Food/Ice Cream parlors (e.g. Ideal/Pabbas): 11:00 AM - 11:00 PM
      return resolveStatus({
        label: '11:00 AM - 11:00 PM',
        ranges: [{ open: 11.0, close: 23.0 }]
      }, place);

    case 'Urban':
      // Malls: 10:00 AM - 10:00 PM
      return resolveStatus({
        label: '10:00 AM - 10:00 PM',
        ranges: [{ open: 10.0, close: 22.0 }]
      }, place);

    default:
      // Generic: 9:00 AM - 8:00 PM
      return resolveStatus({
        label: '9:00 AM - 8:00 PM',
        ranges: [{ open: 9.0, close: 20.0 }]
      }, place);
  }
}

function resolveStatus(timingDef, place) {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeDec = hours + minutes / 60; // Decimal time (e.g. 19.5 for 7:30 PM)

  // Check weekly holiday
  if (timingDef.closedDays && timingDef.closedDays.includes(day)) {
    return {
      label: timingDef.label,
      isOpen: false,
      statusText: 'CLOSED TODAY',
      reason: timingDef.holidayName || 'Weekly Holiday',
      color: 'red',
      timeline: generateTimeline(timingDef.ranges, true)
    };
  }

  // Check open ranges
  let isOpen = false;
  let nextTransition = null; // when it opens or closes next

  for (const range of timingDef.ranges) {
    if (currentTimeDec >= range.open && currentTimeDec < range.close) {
      isOpen = true;
      nextTransition = range.close;
      break;
    }
  }

  // If closed, find next open time
  if (!isOpen) {
    // Find next range today
    const upcomingRange = timingDef.ranges.find(r => r.open > currentTimeDec);
    if (upcomingRange) {
      nextTransition = upcomingRange.open;
    }
  }

  let statusText = '';
  let color = 'red';
  let reason = '';

  if (isOpen) {
    statusText = 'OPEN NOW';
    color = 'green';
    if (nextTransition) {
      const remainingHours = nextTransition - currentTimeDec;
      if (remainingHours < 1) {
        statusText = 'CLOSING SOON';
        color = 'yellow';
        reason = `Closes in ${Math.round(remainingHours * 60)} mins`;
      } else {
        reason = `Open until ${formatDecTime(nextTransition)}`;
      }
    }
  } else {
    statusText = 'CLOSED';
    color = 'red';
    if (nextTransition) {
      const waitHours = nextTransition - currentTimeDec;
      if (waitHours < 1) {
        statusText = 'OPENING SOON';
        color = 'yellow';
        reason = `Opens in ${Math.round(waitHours * 60)} mins`;
      } else {
        reason = `Opens at ${formatDecTime(nextTransition)}`;
      }
    } else {
      reason = 'Opens tomorrow';
    }
  }

  if (timingDef.is24Hours) {
    statusText = 'OPEN 24 HOURS';
    color = 'green';
    reason = 'Always open';
  }

  return {
    label: timingDef.label,
    isOpen,
    statusText,
    reason,
    color,
    timeline: generateTimeline(timingDef.ranges, false)
  };
}

function formatDecTime(dec) {
  const hours = Math.floor(dec);
  const minutes = Math.round((dec - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`;
  return `${displayHours}${displayMinutes} ${ampm}`;
}

function generateTimeline(ranges, isClosedAllDay) {
  // Returns status for each hour from 6:00 to 22:00 (17 hours)
  const timeline = [];
  for (let h = 6; h <= 22; h++) {
    let status = 'closed';
    if (!isClosedAllDay) {
      for (const range of ranges) {
        if (h >= range.open && h < range.close) {
          status = 'open';
          break;
        }
      }
    }
    timeline.push({ hour: h, status });
  }
  return timeline;
}
