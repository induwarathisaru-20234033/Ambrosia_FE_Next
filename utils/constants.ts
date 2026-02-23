export const defaultDateFormat = "mm-dd-yy";

export const defaultTimeFormat = "hh:mm a";

export const hourFormat = {
  twentyFour: "24",
  twelve: "12",
} as const;

export const NumberConstants = {
  MILLISECONDS_PER_SECOND: 1000,
  CURRENCY_DECIMAL_DIGITS: 2,
  MAX_CSV_FILE_SIZE: 5000000,
  METERS_PER_KILOMETER: 1000,
  STEP_MINUTE_INTERVAL: 10,
  ONE_DAY_IN_MINUTES: 1440,
};

export const ServiceLogicTooltipMessages = {
  bufferTime:
    "The time needed to clean and reset a table between guests. This is added to the Turn Time to prevent back-to-back clashes.",
  turnTime:
    "The average time a guest occupies a table. This determines when the table becomes available for the next reservation. (e.g., A 7:00 PM booking with a 90-minute turn time frees the table at 8:30 PM).",
  bookingInterval:
    "How frequently time slots appear to customers. (e.g., '30 Minutes' shows slots at 7:00, 7:30, 8:00. '15 Minutes' shows slots at 7:00, 7:15, 7:30).",
};
