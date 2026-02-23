import {
  addMinutes,
  isAfter,
  isBefore,
  parseISO,
  set,
  isToday as today,
  setSeconds,
  setMilliseconds,
  subMilliseconds,
  addSeconds,
  subSeconds,
  addDays,
  addHours,
} from 'date-fns';
import {
  defaultDateFormat,
  hourFormat,
  NumberConstants,
  defaultTimeFormat,
} from './constants';
import { Nullable } from 'primereact/ts-helpers';


export function parseDate(date: Date | string): Date {
  return typeof date === 'string' ? parseISO(date) : date;
}

export function getNow(): number {
  return Date.now();
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getDateTimeCombinedDate(date: Date, time: Date): Date {
  date?.setHours(time?.getHours());
  date?.setMinutes(time?.getMinutes());
  date?.setSeconds(0, 0);
  return date;
}

export function getDateTimeCombinedString(date: Date, time?: Date): string {
  if (!date) return '';
  if (time) return getDateTimeCombinedDate(date, time).toISOString();
  return date.toISOString();
}

export function getNewDate(): Date {
  const date = new Date();
  date.setSeconds(0, 0);
  return date;
}

export function setDate(date: Date, setOptions: Object): Date {
  return set(date, setOptions);
}

export function setTimeToMidnight(date: Date): Date {
  const setDateOptions: Object = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };
  return setDate(date, setDateOptions);
}

export function isAfterToday(day: Date): boolean {
  return isAfter(day, getNewDate());
}

export function isBeforeToday(day: Date): boolean {
  return isBefore(day, getNewDate());
}

export function isBeforeGivenDate(date: Date, givenDate: Date): boolean {
  return isBefore(givenDate, date);
}

export function isAfterGivenDate(date: Date, givenDate: Date): boolean {
  return isAfter(givenDate, date);
}

export function isToday(date: Date): boolean {
  return today(date);
}

export const combineDateTime = (date: Date, time?: Date | string): Date => {
  if (!time) {
    return setTimeToMidnight(date);
  }
  if (typeof time === 'string') {
    return getDateTimeCombinedDate(date, new Date(time));
  }
  return getDateTimeCombinedDate(date, time);
};

export const isStartDateTimeBeforeEndDateTime = (
  endDate?: Date,
  endTime?: Date | string,
  startDate?: Date,
  startTime?: Date | string,
): boolean => {
  if (!(endDate && startDate)) return true;

  let startDateTime = combineDateTime(startDate, startTime);
  let endDateTime = combineDateTime(endDate, endTime);
  if (startDate && endDate && startTime && endTime) {
    startDateTime.setSeconds(0);
    startDateTime.setMilliseconds(0);
    endDateTime.setSeconds(0);
    endDateTime.setMilliseconds(0);
    if (startDateTime.getTime() === endDateTime.getTime()) return false;
    return startDateTime < endDateTime;
  }
  return true;
};


export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function addHoursToDate(date: Date, hours: number): Date {
  return addHours(date, hours);
}

export function setSecondsForGivenDate(date: Date, seconds: number) {
  return setSeconds(date, seconds);
}

export function setMillisecondsForGivenDate(date: Date, millis: number) {
  return setMilliseconds(date, millis);
}

export function subMillisecondsFromGivenDate(
  dateTime: Date,
  millis: number,
): Date {
  return subMilliseconds(dateTime, millis);
}

export function getNearestMinuteTime(date?: Date | string): Date {
  date = typeof date === 'string' ? new Date(date) : date;
  const now = date ?? getNewDate();
  now.setSeconds(0, 0);
  now.setMinutes(
    Math.ceil(now.getMinutes() / NumberConstants.STEP_MINUTE_INTERVAL) *
      NumberConstants.STEP_MINUTE_INTERVAL,
  );
  return now;
}

export function addSecondsToDate(dateTime: Date, seconds: number): Date {
  return addSeconds(dateTime, seconds);
}

export function subSecondsFromDate(dateTime: Date, seconds: number): Date {
  return subSeconds(dateTime, seconds);
}

export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

export const getSelectedStartDate = (
  searchParameterDate: Nullable<string>,
  date: Date,
) => {
  if (searchParameterDate && !Number.isNaN(Date.parse(searchParameterDate))) {
    const parsedDate = new Date(searchParameterDate);
    if (parsedDate >= getNewDate()) {
      return setTimeToMidnight(parsedDate);
    } else {
      return setTimeToMidnight(date);
    }
  }
  return date;
};

export const getSelectedEndDate = (
  searchParameterDate: Nullable<string>,
  date: Date,
) => {
  if (searchParameterDate && !Number.isNaN(Date.parse(searchParameterDate))) {
    const parsedDate = new Date(searchParameterDate);
    if (parsedDate >= getNewDate()) {
      return setTimeToMidnight(addDaysToDate(parsedDate, 1));
    } else {
      return setTimeToMidnight(date);
    }
  }
  return date;
};



export const toPrimeReactDateFormat = (dateFormat: string) => {
  const dateFormatMap: Record<string, string> = {
    YYYY: 'yy',
    yyyy: 'yy',
    MM: 'mm',
    DD: 'dd',
    SS: 'ss',
  };

  const convertedDateFormat = dateFormat.replaceAll(
    /\b(YYYY|yyyy|MM|DD|SS)\b/g,
    token => dateFormatMap[token],
  );

  return convertedDateFormat.trim();
};
export function toPrimeReactTimeFormat(timeFormat: string) {
  const normalizedTimeFormat = timeFormat.replaceAll(/[\u202F\u00A0]/g, ' ');

  const hFormat: HourFormat =
    /AM|PM|A|a|P|p/.test(normalizedTimeFormat) && !timeFormat.includes('HH')
      ? hourFormat.twelve
      : hourFormat.twentyFour;

  return hFormat;
}

export type HourFormat = (typeof hourFormat)[keyof typeof hourFormat];

export const getPrimeReactHourFormat = (): HourFormat => {
  return toPrimeReactTimeFormat(
    localStorage.getItem('timeFormat') ?? defaultTimeFormat,
  ) === hourFormat.twentyFour
    ? hourFormat.twentyFour
    : hourFormat.twelve;
};

export const getPrimeReactDateFormat = () => {
  return toPrimeReactDateFormat(
    localStorage.getItem('dateFormat') ?? defaultDateFormat,
  );
};

export const hasValidTime = (value: unknown): boolean => {
  if (!value) return false;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return true;
  }

  if (typeof value === "string") {
    return /^(\d{1,2}):(\d{2})/.test(value);
  }

  return false;
};

export const toMinutes = (value: unknown): number | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getHours() * 60 + value.getMinutes();
  }

  if (typeof value === "string") {
    const match = /^(\d{1,2}):(\d{2})/.exec(value);
    if (match) {
      const hours = Number.parseInt(match[1], 10);
      const minutes = Number.parseInt(match[2], 10);
      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        return hours * 60 + minutes;
      }
    }
  }

  return null;
};

