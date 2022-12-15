const originalTimezoneOffset = new Date().getTimezoneOffset();

const { TZ } = process.env;

if (!TZ || TZ !== 'UTC') {
  console.warn(`Forcing UTC timezone. Was ${TZ}.`);
  process.env.TZ = 'UTC';
}

if (originalTimezoneOffset !== 0) {
  console.error(`Timezone offset changed from ${originalTimezoneOffset}. Please set env TZ=UTC.`);
}

const timezoneOffset = new Date().getTimezoneOffset();
if (timezoneOffset !== 0) {
  throw new Error(`Invalid timezone offset: ${timezoneOffset}. Must be 0.`);
}