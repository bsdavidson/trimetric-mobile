export function parseArrivalTime() {
  return {
    fromNow: () => {
      return "in a minute";
    }
  };
}

export function parseTimestamp() {
  return {
    fromNow: () => {
      return "seconds ago";
    }
  };
}
