 
import DatePicker from "@/pages/Overview/datepicker";
import Main from "./Main";
export default function overview() {
  return (
    <>
    <div className="lg:flex lg:items-center lg:justify-between p-4 mx-11">
      <h2 className="text-2xl font-bold sm:text-3xl">Dashboard</h2>
      <div className="lg:flex lg:items-center">
        <DatePicker></DatePicker>
        <button className="mt-2 lg:mt-0 bg-white text-black px-4 py-2 rounded-md">
          Download
        </button>
      </div>
      </div>
      
      <Main></Main>
    </>
  );
}
