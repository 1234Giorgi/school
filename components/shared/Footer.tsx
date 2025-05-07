"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocateIcon, Mail, Phone, ChevronDown, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  const isActive = (href: string) => pathname === href;

  const navItems = [
    {
      href: "https://avtoskola-varketilshi.ge/",
      label: "მთავარი",
      icon: <Home size={16} />,
      dropdown: [
        {
          href: "https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/",
          label: "ჩვენ შესახებ",
        },
        {
          href: "https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/",
          label: "კონტაქტი",
        },
      ],
    },
    {
      href: "https://avtoskola-varketilshi.ge/%e1%83%a1%e1%83%90%e1%83%92%e1%83%96%e1%83%90%e1%83%9d-%e1%83%9c%e1%83%98%e1%83%a8%e1%83%9c%e1%83%94%e1%83%91%e1%83%98/",
      label: "საგზაო ნიშნები",
    },
    { href: "https://biletebi.avtoskola-varketilshi.ge/", label: "ბილეთები" },
    { href: "https://exam.avtoskola-varketilshi.ge/", label: "გამოცდა" },
  ];

  const toggleDropdown = (itemLabel: string) => {
    setOpenDropdown(openDropdown === itemLabel ? null : itemLabel);
  };

  const description = ` პროფესიონალური მძღოლების მომზადების ცენტრი ვარკეთილში. ჩვენი
              მიზანია უსაფრთხო და კომპეტენტური მძღოლების მომზადება.`;

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-10 border-t border-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center md:grid md:grid-cols-3 md:items-start gap-12 mb-12">
          <div className="space-y-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 justify-center"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                ავტოსკოლა
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          </div>
          <div className="w-full md:col-span-2">
            <div className="flex flex-col items-center md:grid md:grid-cols-3 gap-8">
              <div className="w-full max-w-xs text-center md:text-left">
                <h3 className="text-lg font-bold mb-4 text-green-400">
                  ნავიგაცია
                </h3>
                <ul className="space-y-3">
                  {navItems.map((item) => (
                    <li
                      key={item.label}
                      className="flex justify-center md:justify-start"
                    >
                      {item.dropdown ? (
                        <div className="relative w-full max-w-xs">
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className={cn(
                              "flex items-center gap-2 w-full justify-center md:justify-start px-4",
                              "hover:text-green-300 transition-colors",
                              isActive(item.href) && "text-green-400"
                            )}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                            <ChevronDown
                              size={14}
                              className={cn(
                                "ml-auto transition-transform",
                                openDropdown === item.label && "rotate-180"
                              )}
                            />
                          </button>
                          {openDropdown === item.label && (
                            <ul className="mt-2 space-y-2 mx-auto w-48">
                              {item.dropdown.map((subItem) => (
                                <li
                                  key={subItem.href}
                                  className="text-center md:text-left"
                                >
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      "block py-1 text-sm hover:text-green-300 px-4",
                                      isActive(subItem.href) &&
                                        "text-green-400 font-medium"
                                    )}
                                  >
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 justify-center md:justify-start px-4 hover:text-green-300 transition-colors",
                            isActive(item.href) && "text-green-400"
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full max-w-xs text-center md:text-left">
                <h3 className="text-lg font-bold mb-4 text-green-400">
                  კონტაქტი
                </h3>
                <ul className="space-y-3">
                  <li className="flex flex-col items-center md:items-start gap-1">
                    <div className="flex items-center gap-2">
                      <LocateIcon className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400">
                        ვარკეთილი, ჯავახეთის N 102
                      </span>
                    </div>
                  </li>
                  <li className="flex justify-center md:justify-start">
                    <a
                      href="tel:+995574747581"
                      className="flex items-center gap-2 hover:text-green-300 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-green-400" />
                      <span>+995 574-747-581</span>
                    </a>
                  </li>
                  <li className="flex justify-center md:justify-start">
                    <a
                      href="mailto:Guramdiasamidze123@gmail.com"
                      className="flex items-center gap-2 hover:text-green-300 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-green-400" />
                      <span>Guramdiasamidze123@gmail.com</span>
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full max-w-xs text-center md:text-left">
                <h3 className="text-lg font-bold mb-4 text-green-400">
                  სამუშაო საათები
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex justify-between">
                    <span>ორშაბათი - პარასკევი</span>
                    <span>09:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>შაბათი</span>
                    <span>10:00 - 15:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>კვირა</span>
                    <span className="text-gray-400">დასვენების დღე</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} ავტოსკოლა ვარკეთილში. ყველა უფლება
                დაცულია.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                დამზადებულია საქართველოში
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
