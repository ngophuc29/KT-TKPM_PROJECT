import DatePicker from "@/pages/Overview/DatePicker";
import Main from "./Main";
export default function Overview() {
  return (
    <>
      <div className="mx-11 p-4 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">Dashboard</h2>
        <div className="lg:flex lg:items-center">
          <DatePicker></DatePicker>
          <button className="mt-2 rounded-md bg-white px-4 py-2 text-black lg:mt-0">Download</button>
        </div>
      </div>

      <Main />
    </>
  );
}
