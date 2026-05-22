function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-6 border-t border-[#1f1f1f] bg-black px-6 py-10 md:flex-row md:px-20">
      <h2 className="font-[var(--font-display)] text-3xl tracking-[6px] text-white">
        TRUSTWAY
      </h2>

      <p className="text-center text-[11px] tracking-[3px] text-[#555]">
        © 2024 TRUSTWAY INSURANCE GROUP - MADE FOR AUTOMOTIVE ENTHUSIASTS
      </p>

      <div className="flex gap-8">
        <a href="#" className="text-[11px] tracking-[3px] text-white">
          INSTAGRAM
        </a>

        <a href="#" className="text-[11px] tracking-[3px] text-white">
          GITHUB
        </a>
      </div>
    </footer>
  );
}

export default Footer;
