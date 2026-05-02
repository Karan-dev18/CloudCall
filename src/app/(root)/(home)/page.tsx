import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-3xl bg-hero bg-cover shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="bg-white/10 backdrop-blur-md border border-white/10 max-w-[273px] rounded-full py-2 px-4 text-center text-base font-medium">
            Upcoming Meeting at: 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
