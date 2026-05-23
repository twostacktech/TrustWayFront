function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-6 border-t border-[#F0F2F4]/10 bg-black px-6 py-10 md:flex-row md:px-20">
      <h2 className="font-[var(--font-display)] text-3xl tracking-[6px] text-[#F0F2F4]">
        TRUSTWAY
      </h2>

      <p className="text-center text-[11px] tracking-[3px] text-[#F0F2F4]/35">
        2026 TRUSTWAY - MADE BY TWOSTACK GROUP
      </p>

      <div className="flex gap-8">
        <a href="#" className="text-[11px] tracking-[3px] text-[#F0F2F4]">
          INSTAGRAM
        </a>

        <a href="#" className="text-[11px] tracking-[3px] text-[#F0F2F4]">
          GITHUB
        </a>
      </div>
    </footer>
  );
}

export default Footer;
