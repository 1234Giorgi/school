/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  ChevronUp,
  Menu,
  X,
  LocateIcon,
  Mail,
  Phone,
  ChevronDown,
  Home,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  ActiveCategory,
  Question,
  questionCategories,
  vehicleCategories,
} from "@/constants/getdata";
import { cn } from "@/lib/utils";
import { Footer } from "./Footer";

export default function ExamApp() {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<
    string | null
  >(null);
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>({
    id: 0,
    name: "არჩეული კითხვები",
    tickets: 0,
    main: [],
  });
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number | null>
  >({}); // Changed to use question _id as key
  const [lockedQuestions, setLockedQuestions] = useState<
    Record<number, boolean>
  >({}); // Changed to use question _id as key
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state
  const questionsPerPage = 20;

  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  useEffect(() => {
    setIsOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    return pathname === href;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedVehicle) {
      const defaultVehicle = vehicleCategories[0];
      setSelectedVehicle(defaultVehicle.id);
      const gadjetCount = countGadjetOccurrences();
      const questions = getAllQuestionsByGadjet(
        defaultVehicle.gadjet,
        true
      ).slice(0, gadjetCount[defaultVehicle.gadjet]);
      setActiveCategory({
        id: 0,
        name: "არჩეული კითხვები",
        tickets: questions.length,
        main: questions,
      });
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countGadjetOccurrences = (): Record<string, number> => {
    const gadjetCount: Record<string, number> = {};
    vehicleCategories.forEach((vehicle) => {
      Object.values(vehicle.categoryMappings).forEach((category) => {
        category.questions.forEach((question) => {
          gadjetCount[question.gadjet] =
            (gadjetCount[question.gadjet] || 0) + 1;
        });
      });
    });
    return gadjetCount;
  };

  const getAllQuestionsByGadjet = (
    gadjet: string,
    sortById: boolean = false
  ): Question[] => {
    const allQuestions: Question[] = [];
    vehicleCategories.forEach((vehicle) => {
      Object.values(vehicle.categoryMappings).forEach((category) => {
        category.questions.forEach((question) => {
          if (question.gadjet === gadjet) {
            allQuestions.push(question);
          }
        });
      });
    });
    if (sortById) {
      return allQuestions.sort((a, b) => a._id - b._id);
    }
    return allQuestions;
  };

  const getQuestionsByCategoryAndGadjet = (
    vehicleId: string,
    categoryName: string
  ): Question[] => {
    const vehicle = vehicleCategories.find((v) => v.id === vehicleId);
    if (!vehicle) return [];

    const questions = vehicle.categoryMappings[categoryName]?.questions || [];
    return questions.filter((q) => q.gadjet === vehicle.gadjet);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicleCategories.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    setSelectedVehicle(vehicleId);
    setSelectedQuestionCategory(null);
    const gadjetCount = countGadjetOccurrences();
    const questions = getAllQuestionsByGadjet(vehicle.gadjet, true).slice(
      0,
      gadjetCount[vehicle.gadjet]
    );

    setActiveCategory({
      id: 0,
      name: "არჩეული კითხვები",
      tickets: questions.length,
      main: questions,
    });

    setCurrentPage(1);
    setSelectedAnswers({});
    setLockedQuestions({});
  };

  const handleQuestionCategorySelect = (categoryName: string) => {
    if (!selectedVehicle) {
      alert("ჯერ აირჩიეთ კატეგორია სურათიდან!");
      return;
    }

    setSelectedQuestionCategory(categoryName);
    const questions = getQuestionsByCategoryAndGadjet(
      selectedVehicle,
      categoryName
    );

    setActiveCategory({
      id: questionCategories.find((c) => c.name === categoryName)?.id || 0,
      name: categoryName,
      tickets: questions.length,
      main: questions,
    });

    setCurrentPage(1);
    setSelectedAnswers({});
    setLockedQuestions({});
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSearch = () => {
    if (!searchId) return;

    for (const vehicle of vehicleCategories) {
      for (const categoryName in vehicle.categoryMappings) {
        const question = vehicle.categoryMappings[categoryName].questions.find(
          (q) => q._id === Number(searchId)
        );
        if (question) {
          setActiveCategory({
            id: 0,
            name: "ძებნის შედეგი",
            tickets: 1,
            main: [question],
          });
          setCurrentPage(1);
          setSelectedAnswers({});
          setLockedQuestions({});
          return;
        }
      }
    }

    alert("ასეთი ID-ით ბილეთი ვერ მოიძებნა!");
  };

  const handleAnswerClick = (
    questionId: number, // Changed to questionId
    answerIndex: number,
    isCorrect: boolean
  ) => {
    if (lockedQuestions[questionId]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));

    setLockedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredQuestions = activeCategory.main;
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages.map((page, index) => (
      <Button
        key={index}
        onClick={() => typeof page === "number" && handlePageChange(page)}
        className={clsx(
          "px-3 py-2 rounded-md select-none",
          currentPage === page
            ? "bg-white text-gray-700 border-2 hover:text-white border-green-500"
            : "bg-green-500 text-white",
          page === "..." ? "cursor-default" : "cursor-pointer"
        )}
        disabled={page === "..."}
      >
        {page}
      </Button>
    ));
  };

  return (
    <>
      <div className="bg-gray-800 text-white py-2 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="font-medium text-sm mb-2 md:mb-0">
              ავტოსკოლა ვარკეთილში
            </h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Phone
                  size={14}
                  className="bg-green-600 rounded-full w-5 h-5 p-1"
                />
                <a
                  href="tel:+995574747581"
                  className="text-xs hover:text-green-300 transition"
                >
                  +995 574-747-581
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail
                  size={14}
                  className="bg-green-600 rounded-full w-5 h-5 p-1"
                />
                <a
                  href="mailto:Guramdiasamidze123@gmail.com"
                  className="text-xs hover:text-green-300 transition"
                >
                  Guramdiasamidze123@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <LocateIcon
                  size={14}
                  className="bg-green-600 rounded-full w-5 h-5 p-1"
                />
                <span className="text-xs">ვარკეთილი, ჯავახეთის N 102</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-0 z-50 bg-white shadow-sm w-full mb-5">
        <nav className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-red-600">
                <Image
                  src={`/image.png`}
                  alt="car-logo"
                  width={80}
                  height={60}
                  className=""
                />
              </Link>
              <div className="hidden md:flex items-center justify-between gap-x-9">
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg transition",
                      isActive("https://avtoskola-varketilshi.ge/")
                        ? "bg-green-50 text-green-600"
                        : "hover:bg-gray-100 hover:text-green-500"
                    )}
                  >
                    <Home size={16} />
                    <Link
                      href="https://avtoskola-varketilshi.ge/"
                      className={cn(
                        "font-bold",
                        isActive("https://avtoskola-varketilshi.ge/")
                          ? "text-green-600"
                          : "hover:text-green-500"
                      )}
                    >
                      მთავარი
                    </Link>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                        isActive("/") ? "text-green-600" : ""
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                      <Link
                        href="https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                        className={cn(
                          "block px-4 py-2 text-sm font-bold text-gray-700",
                          isActive("/about-us")
                            ? "bg-green-50 text-green-600"
                            : "hover:bg-gray-50 hover:text-green-500"
                        )}
                      >
                        ჩვენ შესახებ
                      </Link>
                      <Separator className="my-1" />
                      <Link
                        href="https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                        className={cn(
                          "block px-4 py-2 text-sm font-bold text-gray-700",
                          isActive(
                            "https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                          )
                            ? "bg-green-50 text-green-600"
                            : "hover:bg-gray-50 hover:text-green-500"
                        )}
                      >
                        კონტაქტი
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  href="https://avtoskola-varketilshi.ge/%e1%83%a1%e1%83%90%e1%83%92%e1%83%96%e1%83%90%e1%83%9d-%e1%83%9c%e1%83%98%e1%83%a8%e1%83%9c%e1%83%94%e1%83%91%e1%83%98/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition gap-2",
                    isActive("/road-signs")
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  საგზაო ნიშნები
                </Link>
                <Link
                  href="https://biletebi.avtoskola-varketilshi.ge/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition",
                    isActive("/tickets")
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  ბილეთები
                </Link>
                <Link
                  href="https://exam.avtoskola-varketilshi.ge/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition",
                    isActive("https://exam.avtoskola-varketilshi.ge/")
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  გამოცდა
                </Link>
              </div>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div
              className={cn(
                "md:hidden transition-all duration-300",
                mobileMenuOpen ? "max-h-screen py-4" : "max-h-0 overflow-hidden"
              )}
            >
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg transition w-full",
                      isActive("https://avtoskola-varketilshi.ge/")
                        ? "bg-green-50 text-green-600"
                        : "hover:bg-gray-100 hover:text-green-500"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Home size={16} />
                    <span className="font-bold">მთავარი</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "ml-auto transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                        isActive("https://avtoskola-varketilshi.ge/")
                          ? "text-green-600"
                          : ""
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "pl-6 transition-all duration-300",
                      isOpen ? "max-h-screen" : "max-h-0 overflow-hidden"
                    )}
                  >
                    <Link
                      href="https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                      className={cn(
                        "block px-4 py-2 text-sm font-bold text-gray-700 rounded-lg",
                        isActive(
                          "https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                        )
                          ? "bg-green-50 text-green-600"
                          : "hover:bg-gray-100 hover:text-green-500"
                      )}
                    >
                      ჩვენ შესახებ
                    </Link>
                    <Link
                      href="https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                      className={cn(
                        "block px-4 py-2 text-sm font-bold text-gray-700 rounded-lg",
                        isActive(
                          "https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                        )
                          ? "bg-green-50 text-green-600"
                          : "hover:bg-gray-100 hover:text-green-500"
                      )}
                    >
                      კონტაქტი
                    </Link>
                  </div>
                </div>
                <Link
                  href="https://avtoskola-varketilshi.ge/%e1%83%a1%e1%83%90%e1%83%92%e1%83%96%e1%83%90%e1%83%9d-%e1%83%9c%e1%83%98%e1%83%a8%e1%83%9c%e1%83%94%e1%83%91%e1%83%98/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition",
                    isActive(
                      "https://avtoskola-varketilshi.ge/%e1%83%a1%e1%83%90%e1%83%92%e1%83%96%e1%83%90%e1%83%9d-%e1%83%9c%e1%83%98%e1%83%a8%e1%83%9c%e1%83%94%e1%83%91%e1%83%98/"
                    )
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  საგზაო ნიშნები
                </Link>
                <Link
                  href="https://biletebi.avtoskola-varketilshi.ge/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition",
                    isActive("https://biletebi.avtoskola-varketilshi.ge/")
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  ბილეთები
                </Link>
                <Link
                  href="https://exam.avtoskola-varketilshi.ge/"
                  className={cn(
                    "px-4 py-2 font-bold rounded-lg transition",
                    isActive("https://exam.avtoskola-varketilshi.ge/")
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-100 hover:text-green-500"
                  )}
                >
                  გამოცდა
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* მთლიანი UI-ის ცენტრირება გაზრდილი ზომით */}
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10">
          <header className="flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {vehicleCategories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleVehicleSelect(category.id)}
                  className={clsx(
                    "flex flex-col items-center px-5 py-2 rounded-md transition select-none",
                    selectedVehicle === category.id
                      ? "bg-gray-500 text-white shadow-md"
                      : "bg-gray-200 hover:bg-gray-300"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={category.icon}
                    alt={category.label}
                    width={60}
                    height={60}
                    className="w-10 h-10 sm:w-20 sm:h-10"
                  />
                  <span className="text-xs sm:text-sm font-medium mt-1">
                    {category.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </header>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Toggle Button for Mobile */}
            <div className="lg:hidden flex justify-between items-center p-4 bg-white">
              <h2 className="text-md font-semibold">კითხვების კატეგორიები</h2>
              <Button
                onClick={toggleSidebar}
                className="bg-green-500 text-white p-2 rounded-md"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>

            {/* Sidebar */}
            <aside
              className={clsx(
                "w-full lg:w-60 bg-white overflow-y-auto flex-shrink-0 transition-all duration-300",
                isSidebarOpen ? "block" : "hidden lg:block"
              )}
            >
              <div className="p-4 lg:block hidden">
                <h2 className="text-md font-semibold text-center">
                  კითხვების კატეგორიები
                </h2>
              </div>
              <div className="p-2">
                <ul>
                  {questionCategories.map((category) => (
                    <motion.li
                      key={category.id}
                      onClick={() =>
                        handleQuestionCategorySelect(category.name)
                      }
                      className={clsx(
                        "p-2 cursor-pointer rounded-md transition flex justify-between select-none",
                        selectedQuestionCategory === category.name
                          ? "bg-gray-500 text-white mb-2"
                          : "hover:bg-stone-100 bg-gray-200 mb-2"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{category.name}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="flex flex-col flex-grow">
              <main className="flex-1 mt-3 p-4 sm:p-6 lg:p-10">
                <div className="max-w-full sm:max-w-5xl mx-auto">
                  <div className="mt-4 text-center">
                    <h2 className="text-lg font-bold">
                      {selectedVehicle
                        ? `${
                            vehicleCategories.find(
                              (v) => v.id === selectedVehicle
                            )?.label
                          } - ${activeCategory.name}`
                        : "აირჩიეთ კატეგორია"}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {selectedVehicle
                        ? `${
                            vehicleCategories.find(
                              (v) => v.id === selectedVehicle
                            )?.gadjet
                          } - სულ ბილეთი: ${activeCategory.tickets}`
                        : "ჯერ არაფერია არჩეული"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between max-w-full sm:max-w-5xl mx-auto mt-5 gap-3">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Button
                      className="bg-green-500 text-white px-3 py-2 rounded-md disabled:opacity-50 select-none"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft size={20} />
                    </Button>
                    {renderPageNumbers()}
                    <Button
                      className="bg-green-500 text-white px-3 py-2 rounded-md disabled:opacity-50"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight size={20} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Input
                      type="text"
                      placeholder="ბილეთის ID..."
                      className="w-full sm:w-[200px] lg:w-[250px]"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <motion.button
                      onClick={handleSearch}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-500 py-1 px-2 rounded-md text-white select-none"
                    >
                      ძებნა
                    </motion.button>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <AnimatePresence mode="wait">
                    {currentQuestions.map((item) => {
                      const isLocked = lockedQuestions[item._id]; // Use _id
                      const selectedAnswer = selectedAnswers[item._id]; // Use _id
                      const correctAnswerIndex = item.answers.findIndex(
                        (a) => a.isCorrect
                      );

                      return (
                        <div key={item._id}>
                          <motion.div
                            // key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-lg p-2 sm:p-2  shadow-md bg-gray-700 max-w-full sm:max-w-5xl mx-auto"
                          >
                            <div className="relative group">
                              <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="bg-black rounded-md ring-2 ring-gray-800">
                                  <span className="p-1">
                                    <b>ID: {item._id}</b>
                                  </span>
                                </span>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <span className="bg-gray-800 p-1 rounded-full cursor-pointer">
                                      <CircleHelp
                                        className="bg-black rounded-full"
                                        size={22}
                                      />
                                    </span>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center justify-between">
                                        #ID: {item._id}
                                        <AlertDialogCancel>x</AlertDialogCancel>
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {item.answeringQuestion}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <motion.div className="flex justify-center">
                                <Image
                                  src={item.image}
                                  alt="question image"
                                  width={
                                    item.image ===
                                    "https://www.starti.ge/exam/shss.png"
                                      ? 200
                                      : 800
                                  }
                                  height={
                                    item.image ===
                                    "https://www.starti.ge/exam/shss.png"
                                      ? 100
                                      : 800
                                  }
                                  className={clsx(
                                    "border-none rounded-md border-gray-700 object-contain w-full",
                                    item.image ===
                                      "https://www.starti.ge/exam/shss.png"
                                      ? "max-w-[200px] h-[200px] mx-auto"
                                      : "max-w-[600px] sm:max-w-[900px] lg:max-w-[1100px] h-auto"
                                  )}
                                  unoptimized
                                />
                              </motion.div>
                            </div>
                            <p className="mt-4 text-base sm:text-lg font-semibold text-white text-center">
                              {item.desc}
                            </p>
                            <ul className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                              {item.answers.map((answer, answerIndex) => {
                                const isSelected =
                                  selectedAnswer === answerIndex;
                                const isCorrect = answer.isCorrect;
                                const showCorrect =
                                  isLocked &&
                                  answerIndex === correctAnswerIndex;

                                return (
                                  <motion.li
                                    key={answerIndex}
                                    onClick={() =>
                                      !isLocked &&
                                      handleAnswerClick(
                                        item._id, // Use _id
                                        answerIndex,
                                        isCorrect
                                      )
                                    }
                                    className={clsx(
                                      "flex p-3 border rounded-md cursor-pointer transition font-semibold select-none text-sm sm:text-lg w-full sm:w-[calc(50%-0.5rem)]", // 50% width minus gap for two columns
                                      isLocked
                                        ? "cursor-not-allowed"
                                        : "hover:bg-gray-200",
                                      isSelected && isCorrect
                                        ? "bg-green-500 text-white"
                                        : isSelected
                                        ? "bg-red-500 text-white"
                                        : showCorrect
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100"
                                    )}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      minHeight: "60px", // Minimum height to avoid being too small
                                    }}
                                    whileHover={{ scale: isLocked ? 1 : 1.02 }}
                                    whileTap={{ scale: isLocked ? 1 : 0.98 }}
                                  >
                                    <span
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        fontSize: "14px !important",
                                        backgroundColor: "white",
                                        color: "black",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontFamily: "Arial, sans-serif",
                                        borderRadius: "5px",
                                        marginRight: "8px",
                                        lineHeight: "30px",
                                        flexShrink: 0, // Prevents the span from shrinking
                                      }}
                                    >
                                      {answerIndex + 1}
                                    </span>
                                    <div
                                      className="flex-1"
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        whiteSpace: "normal", // Allows text to wrap
                                      }}
                                    >
                                      {answer.text}
                                    </div>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          </motion.div>
                          <div>
                            <Separator className="my-10" />
                          </div>
                        </div>
                      );
                    })}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Button
                      className="bg-green-500 text-white px-3 py-2 rounded-md disabled:opacity-50"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft size={20} />
                    </Button>
                    {renderPageNumbers()}
                    <Button
                      className="bg-green-500 text-white px-3 py-2 rounded-md disabled:opacity-50"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight size={20} />
                    </Button>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  onClick={scrollToTop}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center"
                >
                  <ChevronUp size={20} className="sm:size-28" />
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-10 sm:right-14 bg-green-600 text-white text-xs sm:text-sm font-medium px-2 py-1 rounded-md"
                  >
                    ზევით
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <Footer />
    </>
  );
}
