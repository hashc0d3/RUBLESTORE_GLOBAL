import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="w-full">
      {/* Hero: картинка на всю ширину и 80% высоты, текст поверх */}
      <section className="relative h-[80vh] w-full min-h-[320px] overflow-hidden bg-neutral-200">
        {/* Картинка на весь блок */}
        <Image
          src="/apple-m.jpg"
          alt=""
          fill
          className="object-cover object-center md:hidden"
          sizes="100vw"
          priority
        />
        <Image
          src="/apple.jpg"
          alt=""
          fill
          className="hidden object-cover object-center md:block"
          sizes="100vw"
          priority
        />
        {/* Текст и кнопки поверх картинки */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-[6vh] px-4 text-center md:pt-[8vh]">
          <div className="flex max-w-xl flex-col items-center gap-6">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
              iPhone
            </h1>
            <p className="text-lg text-neutral-600 md:text-xl">
              RubleStore — твой надёжный поставщик техники Apple.
            </p>
            <Link
              href="/catalog?category=iphone"
              className="rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed]"
            >
              Каталог iPhone
            </Link>
          </div>
        </div>
      </section>

      {/* Между блоками: полный каталог и логотип */}
      <section className="w-full border-y border-neutral-200 bg-white py-12 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 px-4 text-center">
          <Link
            href="/catalog"
            className="rounded-full border-2 border-neutral-300 bg-transparent px-6 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-900"
          >
            Полный каталог товаров
          </Link>
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-neutral-900 transition hover:text-neutral-600 md:text-3xl"
            aria-label="RubleStore — на главную"
          >
            RubleStore
          </Link>
        </div>
      </section>

      {/* Второй блок: AirPods — мобилка: как первый блок (hero + текст поверх), десктоп: две колонки */}
      {/* Мобилка: дублирует первый блок — картинка на весь блок, текст поверх */}
      <section className="relative h-[80vh] min-h-[320px] w-full overflow-hidden bg-neutral-200 md:hidden">
        <Image
          src="/airpods-m.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-[6vh] px-4 text-center">
          <div className="flex max-w-xl flex-col items-center gap-6">
            <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
              AirPods и аксессуары
            </h2>
            <p className="text-lg text-neutral-600 md:text-xl">
              Улучшите звук с AirPods, чехлами, зарядками и не только.
            </p>
            <Link
              href="/catalog?category=airpods"
              className="inline-flex rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed]"
            >
              Каталог AirPods
            </Link>
          </div>
        </div>
      </section>

      {/* Десктоп: две колонки — картинка слева, текст справа */}
      <section className="hidden w-full min-h-[280px] bg-white md:block md:h-[60vh] md:min-h-[320px] md:pb-12">
        <div className="mx-auto grid h-full min-h-[280px] max-w-6xl grid-cols-2 items-center gap-12 px-12 py-0 lg:px-16">
          <div className="relative flex h-full w-full min-h-0 items-center justify-center p-0">
            <div className="relative h-full w-full min-h-0">
              <Image
                src="/airpods.jpeg"
                alt="AirPods и аксессуары"
                fill
                className="object-contain object-center"
                sizes="50vw"
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-center py-12 text-left">
            <div className="flex max-w-md flex-col gap-6">
              <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl">
                AirPods и аксессуары
              </h2>
              <p className="text-lg text-neutral-600 md:text-xl">
                Улучшите звук с AirPods, чехлами, зарядками и не только.
              </p>
              <div>
                <Link
                  href="/catalog?category=airpods"
                  className="inline-flex rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0077ed]"
                >
                  Каталог AirPods
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
