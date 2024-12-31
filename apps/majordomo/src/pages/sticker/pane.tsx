import {
  FacebookIcon,
  LinkedinIcon,
  LinkIcon,
  MailIcon,
  MapIcon,
  PhoneIcon,
  RocketIcon,
  SparklesIcon,
  TwitterIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logo from "../../assets/img/logo.svg";

const MAX_POSITION_LEN = 90;

export function Pane({ closePane }: { closePane: () => void }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  function truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  useEffect(() => {
    const extractInfo = () => {
      const nameElement = document.querySelector(
        ".artdeco-entity-lockup__title",
      );
      const positionElement = document.querySelector(
        ".artdeco-entity-lockup__subtitle",
      );
      const pictureUrlElement = document.querySelector(
        'img[class*="pv-top-card-profile-picture__image"]',
      ) as HTMLImageElement;

      if (nameElement) {
        setName(nameElement.textContent?.trim() || "");
      }
      if (positionElement) {
        setPosition(positionElement.textContent?.trim() || "");
      }
      if (pictureUrlElement && pictureUrlElement.src) {
        setPictureUrl(pictureUrlElement.src);
      }
    };

    if (document.readyState === "complete") {
      extractInfo();
    } else {
      window.addEventListener("load", extractInfo);
      return () => window.removeEventListener("load", extractInfo);
    }
  }, []);

  return (
    <div className="relative ml-12 flex h-[66rem] w-[40rem] flex-col items-start gap-y-7 rounded-lg bg-white p-8 shadow-lg">
      <nav className="mb-2 flex w-full items-center justify-between">
        <div className="flex items-center gap-x-3">
          <img src={logo} className="h-10 w-10 rounded-md" alt="Logo" />
          <p className="text-3xl">Apriora</p>
        </div>
        <XIcon
          size={32}
          color="gray"
          className="cursor-pointer rounded-md p-2 transition-all hover:bg-gray-200"
          onClick={closePane}
        />
      </nav>

      <div className="flex items-center gap-x-6">
        <img
          className="h-32 w-32 rounded-full object-cover"
          src={pictureUrl}
          alt={name}
        />
        <div className="flex w-3/4 flex-col">
          <h1 className="text-2xl font-semibold">{name}</h1>
          <h2 className="text-lg font-light text-gray-600">
            {truncateText(position, MAX_POSITION_LEN)}
          </h2>
        </div>
      </div>

      <button
        className="flex w-full justify-center gap-x-3 rounded-md bg-blue-500 px-6 py-3 transition-all hover:brightness-125"
        onClick={
          email && phone && city
            ? () => toast.success(`Hey ${name} 👋`)
            : () => {
                toast.info("Apollo to the mooooooon 🚀");
                setTimeout(() => setEmail("susantoscott@gmail.com"), 2000);
                setTimeout(() => setPhone("(123) 456-7890"), 2500);
                setTimeout(() => setCity("San Francisco"), 3000);
              }
        }
      >
        {email && phone && city ? (
          <>
            <p className="text-lg font-semibold text-white">
              Introduce {name} to Alex
            </p>
            <SparklesIcon size={20} color="white" />
          </>
        ) : (
          <>
            <p className="text-xl font-semibold text-white">Use Apollo</p>
            <RocketIcon size={20} color="white" />
          </>
        )}
      </button>

      <div className="flex w-full flex-col gap-y-3 text-gray-800">
        <div className="flex items-center justify-start gap-x-8">
          <MailIcon size={24} />
          {email ? (
            <span>{email}</span>
          ) : (
            <span
              className="cursor-pointer font-medium text-blue-600 transition-all hover:text-blue-400"
              onClick={() => {
                toast.info("Getting email address...");
                setTimeout(() => setEmail("susantoscott@gmail.com"), 2000);
              }}
            >
              Get email address
            </span>
          )}
        </div>
        <div className="flex items-center justify-start gap-x-7">
          <PhoneIcon size={24} />
          {phone ? (
            <span>{phone}</span>
          ) : (
            <span
              className="cursor-pointer font-medium text-blue-600 transition-all hover:text-blue-400"
              onClick={() => {
                toast.info("Getting phone number...");
                setTimeout(() => setPhone("(123) 456-7890"), 2000);
              }}
            >
              Get email address
            </span>
          )}
        </div>
        <div className="flex items-center justify-start gap-x-7">
          <MapIcon size={24} />
          {city ? (
            <span>{city}</span>
          ) : (
            <span
              className="cursor-pointer font-medium text-blue-600 transition-all hover:text-blue-400"
              onClick={() => {
                toast.info("Getting location...");
                setTimeout(() => setCity("San Francisco"), 2000);
              }}
            >
              Get email address
            </span>
          )}
        </div>
      </div>

      <hr className="w-full" />

      <div className="flex flex-col gap-y-4">
        <div className="flex w-full items-center gap-x-4">
          <h3>Apriora</h3>
          <div className="flex gap-x-2">
            <a
              href="https://apriora.ai"
              target="_blank"
              className="cursor-pointer rounded-md p-1 text-black no-underline transition-all visited:text-black hover:bg-gray-200 hover:text-black"
            >
              <LinkIcon size={20} />
            </a>
            <a
              href="https://linkedin.com/company/apriora/"
              target="_blank"
              className="cursor-pointer rounded-md p-1 text-black no-underline transition-all visited:text-black hover:bg-gray-200 hover:text-black"
            >
              <LinkedinIcon size={20} />
            </a>
            <a
              href=""
              target="_blank"
              className="cursor-pointer rounded-md p-1 text-black no-underline transition-all visited:text-black hover:bg-gray-200 hover:text-black"
            >
              <FacebookIcon size={20} />
            </a>
            <a
              href="https://x.com/aprioraAI"
              target="_blank"
              className="cursor-pointer rounded-md p-1 text-black no-underline transition-all visited:text-black hover:bg-gray-200 hover:text-black"
            >
              <TwitterIcon size={20} />
            </a>
          </div>
        </div>
        <h5>Hire the best candidates, faster</h5>
        <p>
          Say hi to Alex 👋 who conducts live interviews to screen more
          candidates and make better hiring decisions.
        </p>
        <p>
          Welcome to the world of automated scheduling, live interviewing, and
          instant feedback.
        </p>
        <p>Start today!</p>
      </div>
    </div>
  );
}
