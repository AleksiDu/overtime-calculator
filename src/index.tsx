import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";

const app = new Elysia()
  .use(html())
  .get("/", ({ html }) =>
    html(
      <BaseHtml>
        <body
          class="flex w-full h-screen justify-center items-center"
          hx-get="/overtimes"
          hx-trigger="load"
          hx-swap="innerHTML"
        >
          <button
            class="rounded-none border-4 bg-sky-500/50 hover:bg-sky-500/100"
            hx-post="/clicked"
            hx-swap="outerHTML"
          >
            Click me
          </button>
        </body>
      </BaseHtml>
    )
  )
  .post("/clicked", () => <div class="text-blue-600">I'm from the server!</div>)
  .get("/overtimes", () => <OvertimeList overtimes={db} />)
  .post(
    "/overtimes",
    ({ body }) => {
      const rate = parseFloat(body.rate);
      const hour = parseFloat(body.hour);

      if (rate === undefined || hour === undefined) {
        throw new Error("Rate and hour parameters are required.");
      }

      const calculateOvertimePay = (
        rate: number,
        hoursWorked: number
      ): number => {
        const regularHoursPerDay = 8; // Assuming 8 hours is a regular workday
        const overtimeMultiplier = 1.5; // Overtime rate is 1.5 times the regular rate

        let regularPay = 0;
        let overtimePay = 0;
        let overtimeHours = 0;

        if (hoursWorked > regularHoursPerDay) {
          // Calculate regular pay for the first 8 hours
          regularPay = rate * regularHoursPerDay;

          // Calculate overtime pay for hours worked beyond 8 hours
          overtimeHours = hoursWorked - regularHoursPerDay;
          overtimePay = rate * overtimeHours * overtimeMultiplier;
        } else {
          // No overtime, all hours are regular
          regularPay = rate * hoursWorked;
        }

        return overtimePay;
      };

      const newOvertime = {
        id: Math.random(),
        rate: rate,
        hour: hour,
        date: new Date(),
        overtimePay: calculateOvertimePay(rate, hour),
      };
      db.push(newOvertime);
      return <OvertimeItem {...newOvertime} />;
    },
    {
      body: t.Object({
        rate: t.String(),
        hour: t.String(),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Overtime Calculator</title>
    <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  ${children}

`;

type Overtime = {
  id: number;
  rate: number;
  hour: number;
  date: Date;
  overtimePay?: number;
};

const db: Overtime[] = [
  { id: 1, rate: 16, hour: 3, overtimePay: 10, date: new Date() },
  { id: 2, rate: 16, hour: 3, overtimePay: 9, date: new Date() },
];

const OvertimeItem = ({ rate, hour, date, overtimePay }: Overtime) => {
  return (
    <tr class="border-b dark:border-neutral-500">
      <td class="whitespace-nowrap px-6 py-4">{rate}</td>
      <td class="whitespace-nowrap px-6 py-4">{hour}</td>
      <td class="whitespace-nowrap px-6 py-4">{overtimePay}</td>
      <td class="whitespace-nowrap px-6 py-4">{date}</td>
    </tr>
  );
};

const OvertimeList = ({ overtimes }: { overtimes: Overtime[] }) => {
  return (
    <div class="flex flex-col overflow-x-auto">
      <div class="sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm font-light">
              <thead class="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" class="px-6 py-4">
                    Rate
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Hour
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Overtime Pay
                  </th>
                  <th scope="col" class="px-6 py-4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {overtimes.map((overtime) => (
                  <OvertimeItem {...overtime} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <OvertimeForm />
    </div>
  );
};

const OvertimeForm = () => {
  return (
    <form hx-post="/overtimes" hx-swap="beforebegin">
      <div class="relative mb-3" data-te-input-wrapper-init>
        <input
          type="number"
          name="rate"
          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none  dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
          placeholder="0"
          id="rate"
          data-te-input-state-active
        />
        <label
          for="rate"
          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        >
          Overtime Rate
        </label>
        <div class="relative mb-3" data-te-input-wrapper-init>
          <input
            type="number"
            name="hour"
            class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
            placeholder="0"
            id="hour"
            data-te-input-state-active
          />
          <label
            for="hour"
            class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
          >
            Hours Worked
          </label>
        </div>
        <button
          type="submit"
          class="inline-block rounded border-2 border-primary-100 px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:border-primary-accent-100 hover:bg-neutral-500 hover:bg-opacity-10 focus:border-primary-accent-100 focus:outline-none focus:ring-0 active:border-primary-accent-200 dark:text-primary-100 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
          data-te-ripple-init
        >
          Add Overtime
        </button>
      </div>
    </form>
  );
};
