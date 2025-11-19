"use client";

import TopNavbar from "../components/dashboard/topnav";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="absolute inset-0 grid grid-cols-2 gap-0 z-10 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "url(/mask.avif)",
            backgroundRepeat: "repeat-y",
            backgroundSize: "100% 600px",
            mixBlendMode: "lighten",
            opacity: 0.1,
          }}
        />
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "url(/mask.avif)",
            backgroundRepeat: "repeat-y",
            backgroundSize: "100% 600px",
            mixBlendMode: "lighten",
            opacity: 0.1,
          }}
        />
      </div>
      <div className="relative z-20">
        <TopNavbar />
      </div>

      <div className="relative z-20 max-w-[1440px] mx-auto">{children}</div>
    </div>
  );
};

export default Layout;
