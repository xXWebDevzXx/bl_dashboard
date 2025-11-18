
function AsideNav(){
    return (<div className="bg-[#1A1F26] flex flex-col w-fit min-h-full p-8 text-white">
        <nav className="flex flex-col gap-4">
                <a href="/dashboard" className="hover:underline">Dashboard</a>
                <a href="/tasks" className="hover:underline">Tasks</a>
                <a href="/compare" className="hover:underline">Compare</a>
                <a href="/settings" className="hover:underline">Settings</a>
        </nav>
    </div>);
}

export default AsideNav;