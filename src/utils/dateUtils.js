import { formatInTimeZone } from "date-fns-tz";

/**
 * Converts a timestamp (epoch) to New Zealand date string.
 * Example output: "11 Jun"
 */
export const getNZDateString = (epoch) => {
  if (!epoch) return "Unknown";

  return formatInTimeZone(
    new Date(Number(epoch)),
    "Pacific/Auckland",
    "dd MMM"
  );
};

/**
 * Converts a timestamp to full New Zealand date + time.
 * Example output: "11 Jun 2026, 11:00 AM"
 */
export const getNZFullDateTime = (epoch) => {
  if (!epoch) return "";

  return formatInTimeZone(
    new Date(Number(epoch)),
    "Pacific/Auckland",
    "dd MMM yyyy, h:mm a"
  );
};

/**
 * Returns current date in New Zealand timezone.
 * Example output: "15 Jul"
 */
export const getCurrentNZDate = () => {
  return formatInTimeZone(new Date(), "Pacific/Auckland", "dd MMM");
};

/**
 * Returns current full date-time in New Zealand timezone.
 */
export const getCurrentNZDateTime = () => {
  return formatInTimeZone(
    new Date(),
    "Pacific/Auckland",
    "dd MMM yyyy, h:mm a"
  );
};

/**
 * Checks if the given epoch falls on today in New Zealand time.
 */
export const isTodayInNZ = (epoch) => {
  const today = getCurrentNZDate();
  const dateStr = getNZDateString(epoch);
  return today === dateStr;
};

/**
 * Formats epoch for display in order details (more readable).
 */
export const formatOrderDateTime = (epoch) => {
  if (!epoch) return "N/A";

  return formatInTimeZone(
    new Date(Number(epoch)),
    "Pacific/Auckland",
    "EEEE, dd MMMM yyyy • h:mm a"
  );
};