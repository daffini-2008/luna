"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Heart,
  HeartHandshake,
  MessageCircle,
  Moon,
  PawPrint,
  Search,
  Sparkles,
  Sun,
  Undo2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  celebrities,
  pets,
  quizQuestions,
  type Celebrity,
  type Pet,
} from "@/lib/data";
import { answerSummary, scoreMatch } from "@/lib/matching";
import { fictionalProfiles, type FictionalProfile } from "@/lib/fictional-profiles";
import { type ChatMessage } from "@/lib/ai-chat";
import FictionalChat from "@/components/fictional-chat";

type View = "home" | "quiz" | "dashboard" | "discover" | "chat" | "celebrities" | "pets" | "liked" | "history" | "notifications" | "settings";
type Preference = "Women" | "Men" | "Everyone";
type PetPreference = "Cats" | "Dogs" | "Both" | "Neither";

type MemberProfile = {
  name: string;
  birthDate: string;
  gender: string;
  preferredGender: Preference;
  location: string;
  description: string;
  photo?: string;
  petPreference: PetPreference;
};

type DemoMember = FictionalProfile & {
  city: string;
  intro: string;
  tags: string[];
  colour: string;
};

type NotificationKind = "match" | "liked" | "reply";

type LocalNotification = {
  id: string;
  text: string;
  kind: NotificationKind;
  profileId?: string;
  createdAt: string;
};

type SavedState = {
  profile: MemberProfile;
  answers: number[];
  liked: string[];
  passed: string[];
  favourites: string[];
  dark: boolean;
  notificationCount: number;
  notifications: LocalNotification[] | string[];
  chats?: Record<string, ChatMessage[]>;
};

const storageKey = "lunas-matrimony-v1";
const people: DemoMember[] = fictionalProfiles.map((person, index) => ({
  ...person,
  city: person.location,
  intro: person.bio,
  colour: ["#dfc4cc", "#d8cdb2", "#c5d0c0", "#c8c0d8"][index % 4],
}));

const legacyProfileIds: Record<string, string> = {
  maya: "maya-chen",
  leo: "leo-martin",
  amara: "amara-okafor",
  noah: "noah-bennett",
  elle: "elle-williams",
  arjun: "arjun-mehta",
  rose: "rose-carter",
  kai: "kai-fernandes",
};

function restoreProfileIds(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string").map((id) => legacyProfileIds[id] ?? id)
    : [];
}

function restoreNotifications(value: SavedState["notifications"] | undefined): LocalNotification[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (typeof item === "string") {
      return [{ id: `legacy-${index}-${item.slice(0, 20)}`, text: item, kind: "match" as const, createdAt: new Date().toISOString() }];
    }
    if (item && typeof item === "object" && typeof item.id === "string" &&
      typeof item.text === "string" && typeof item.createdAt === "string" &&
      (item.kind === "match" || item.kind === "liked" || item.kind === "reply")) {
      return [item];
    }
    return [];
  });
}

function isChatReply(value: unknown): value is { reply: string; mode: "demo" | "ai" } {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return typeof result.reply === "string" && (result.mode === "demo" || result.mode === "ai");
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function ageFromDate(dateString: string) {
  const birthday = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) age--;
  return age;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

function LunaMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`luna-mark${small ? " luna-mark-small" : ""}`} aria-hidden="true">
      <span className="cat-ear cat-ear-left" /><span className="cat-ear cat-ear-right" />
      <span className="cat-face">✦</span>
    </span>
  );
}

function Portrait({
  name,
  compact = false,
  colour,
}: {
  name: string;
  compact?: boolean;
  colour?: string;
}) {
  const [portrait, setPortrait] = useState<{
    image: string;
    filePage: string;
    license: string;
    licenseUrl: string;
    artist: string;
  }>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/portraits?name=${encodeURIComponent(name)}`)
      .then(async (response) => {
        if (!response.ok) {
          if (active) setFailed(true);
          return;
        }
        const result = await response.json();
        if (active) setPortrait(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, [name]);

  return (
    <>
      {portrait && !failed ? (
        <Image
          alt={`${name}, celebrity-inspired entertainment profile`}
          className="celebrity-photo"
          fill
          onError={() => setFailed(true)}
          sizes={compact ? "100px" : "(max-width: 700px) 45vw, 260px"}
          src={portrait.image}
          unoptimized
        />
      ) : (
        <span
          aria-label={`${name} portrait not available`}
          className="portrait-fallback"
          style={{ background: colour ?? "linear-gradient(145deg,#dbc7cd,#b8abc9)" }}
        >
          <span className="portrait-sparkle">✧</span>{initials(name)}
          {failed ? <span className="portrait-note">Portrait unavailable</span> : <span className="portrait-note">Finding portrait…</span>}
        </span>
      )}
      {portrait && !failed && (
        <a
          className="portrait-attribution"
          href={portrait.filePage}
          target="_blank"
          rel="noreferrer"
          title={`Photo by ${portrait.artist}. Licensed ${portrait.license}; view license details.`}
        >
          {portrait.license} · credits
        </a>
      )}
    </>
  );
}

function MemberPortrait({
  profile,
  className = "",
}: {
  profile: DemoMember;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const classNames = `member-portrait ${className}`;

  if (failed) {
    return <span className={`${classNames} member-portrait-fallback`} style={{ background: profile.colour }}>{initials(profile.name)}</span>;
  }

  return (
    <span className={classNames} style={{ background: profile.colour }}>
      <Image
        alt={`Synthetic AI portrait of fictional character ${profile.name}`}
        fill
        onError={() => setFailed(true)}
        sizes="(max-width: 700px) 90vw, 475px"
        src={profile.portrait}
        unoptimized
      />
    </span>
  );
}

function SwipeDeck({
  profile,
  percentage,
  shared,
  ready,
  onAction,
  onDetails,
}: {
  profile: DemoMember;
  percentage: number;
  shared: string[];
  ready: boolean;
  onAction: (action: "like" | "pass" | "favourite") => void;
  onDetails: () => void;
}) {
  return (
    <section className="swipe-section" aria-label="Swipe through match recommendations">
      <div className="swipe-title"><div><Label>A LITTLE SPARK, ONE SWIPE AT A TIME</Label><h2>Meet your next <em>maybe.</em></h2></div><span>Drag the card or choose your feeling</span></div>
      <motion.div
        className="swipe-card"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.75}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) onAction("like");
          else if (info.offset.x < -90) onAction("pass");
        }}
        whileDrag={{ rotate: 5, scale: 1.015, cursor: "grabbing" }}
      >
        <div className="swipe-art" style={{ background: profile.colour }}>
          <MemberPortrait profile={profile} className="swipe-avatar" />
          <span className="match-pill">{ready ? `${percentage}% compatible` : "Take quiz to match"}</span>
          <span className="swipe-arrow swipe-arrow-left">× PASS</span>
          <span className="swipe-arrow swipe-arrow-right">♡ LIKE</span>
          <span className="swipe-art-sparkle">✧</span>
        </div>
        <div className="swipe-details">
          <div className="swipe-name-row"><div><h3>{profile.name}, {profile.age}</h3><span>{profile.city}</span></div>{ready && <span className="swipe-mini-score">{percentage}% <Heart size={13} fill="currentColor" /></span>}</div>
          <p>{profile.intro}</p>
          <div className="tag-row">{ready ? shared.length ? shared.map((tag) => <span className="soft-tag" key={tag}>{tag}</span>) : <span className="soft-tag">a fresh start</span> : <span className="soft-tag">Quiz for shared interests</span>}</div>
          <button className="text-link" onClick={onDetails}>Meet {profile.name} <ArrowRight size={14} /></button>
        </div>
      </motion.div>
      <div className="swipe-controls">
        <button className="swipe-pass" onClick={() => onAction("pass")} aria-label="Pass on profile"><X size={21} /></button>
        <button className="swipe-favourite" onClick={() => onAction("favourite")} aria-label="Save as a favourite"><Zap size={18} fill="currentColor" /></button>
        <button className="swipe-like" onClick={() => onAction("like")} aria-label="Like profile"><Heart size={21} fill="currentColor" /></button>
      </div>
      <p className="swipe-disclaimer">Demo profiles only. Your choices stay right here — nothing is sent.</p>
    </section>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [passed, setPassed] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"demo" | "ai">("demo");
  const [showAllMatches, setShowAllMatches] = useState(false);
  const openingChats = useRef(new Set<string>());
  const [confettiActive, setConfettiActive] = useState(false);
  const [toast, setToast] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("Everyone");
  const [minimumScore, setMinimumScore] = useState(0);
  const [activeProfile, setActiveProfile] = useState<{ kind: "person" | "celebrity" | "pet"; value: DemoMember | Celebrity | Pet } | null>(null);
  const [registrationError, setRegistrationError] = useState("");
  const [petPreference, setPetPreference] = useState<PetPreference>("Both");
  const [profilePhoto, setProfilePhoto] = useState<string>();
  const [hydrated, setHydrated] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [visibleCelebrityCount, setVisibleCelebrityCount] = useState(10);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state: SavedState = JSON.parse(saved);
        setProfile(state.profile);
        setAnswers(Array.isArray(state.answers) ? state.answers : []);
        setLiked(restoreProfileIds(state.liked));
        setPassed(restoreProfileIds(state.passed));
        setFavourites(restoreProfileIds(state.favourites));
        setDark(Boolean(state.dark));
        setNotificationCount(typeof state.notificationCount === "number" ? state.notificationCount : 0);
        setNotifications(restoreNotifications(state.notifications));
        setChats(state.chats && typeof state.chats === "object" ? state.chats : {});
        setPetPreference(state.profile.petPreference ?? "Both");
        setGenderFilter(state.profile.preferredGender ?? "Everyone");
        setView(state.answers?.length === quizQuestions.length ? "dashboard" : "home");
      }
    } catch (error) {
      console.error("Could not restore Luna's Matrimony demo data.", error);
      setToast("We couldn't restore your saved demo. You can start fresh.");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || profile) return;
    setAnswers([]);
    setLiked([]);
    setPassed([]);
    setFavourites([]);
    setNotifications([]);
    setNotificationCount(0);
    setChats({});
    setActiveChatId(null);
    setChatLoading(false);
    setProfilePhoto(undefined);
  }, [hydrated, profile]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    if (!hydrated || !profile) return;
    try {
      const state: SavedState = {
        profile: { ...profile, petPreference },
        answers,
        liked,
        passed,
        favourites,
        dark,
        notificationCount,
        notifications,
        chats,
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Could not save Luna's Matrimony demo data.", error);
      setToast("Your browser couldn't save this change. Check available storage.");
    }
  }, [answers, chats, dark, favourites, hydrated, liked, notificationCount, notifications, passed, petPreference, profile]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const completed = answers.length === quizQuestions.length;
  const userTags = useMemo(
    () => answers.flatMap((answer, index) => quizQuestions[index]?.options[answer]?.tags ?? []),
    [answers],
  );

  const personMatches = useMemo(() => people
    .map((person) => ({ person, match: scoreMatch(answers, quizQuestions, person.tags) }))
    .filter(({ person, match }) => {
      const genderOkay = genderFilter === "Everyone" || genderFilter === (person.gender === "woman" ? "Women" : "Men");
      return genderOkay && !passed.includes(person.id) && (!completed || match.percentage >= minimumScore) && (!search || person.name.toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a, b) => b.match.percentage - a.match.percentage), [answers, completed, genderFilter, minimumScore, passed, search]);
  const visiblePersonMatches = showAllMatches ? personMatches : personMatches.slice(0, 10);

  const celebMatches = useMemo(() => celebrities
    .map((celebrity) => ({ celebrity, match: scoreMatch(answers, quizQuestions, celebrity.tags) }))
    .filter(({ celebrity, match }) => {
      const genderOkay = genderFilter === "Everyone" || genderFilter === (celebrity.gender === "woman" ? "Women" : "Men");
      return genderOkay && (!completed || match.percentage >= minimumScore) && (!search || celebrity.name.toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a, b) => b.match.percentage - a.match.percentage), [answers, completed, genderFilter, minimumScore, search]);

  const bestMatch = personMatches[0] ?? people
    .map((person) => ({ person, match: scoreMatch(answers, quizQuestions, person.tags) }))
    .sort((a, b) => b.match.percentage - a.match.percentage)[0];
  const nextSwipe = personMatches.find(({ person }) => !passed.includes(person.id) && !liked.includes(person.id));
  const historyItems = [
    ...liked.map((id) => ({ id, status: "Liked" })),
    ...passed.map((id) => ({ id, status: "Passed" })),
  ];

  const notify = useCallback((text: string, profileId?: string, kind: NotificationKind = "match") => {
    const notification: LocalNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      kind,
      profileId,
      createdAt: new Date().toISOString(),
    };
    setToast(text);
    setNotificationCount((count) => count + 1);
    setNotifications((current) => [notification, ...current]);
  }, []);

  const requestChatReply = useCallback(async (
    profileId: string,
    history: Array<Pick<ChatMessage, "role" | "content">>,
  ) => {
    const character = fictionalProfiles.find((item) => item.id === profileId);
    if (!character) {
      setToast("That fictional profile is no longer available.");
      return;
    }

    const opening = history.length === 0;
    if (opening && openingChats.current.has(profileId)) return;
    if (opening) openingChats.current.add(profileId);
    setChatLoading(true);
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, messages: history }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isChatReply(result)) {
        const errorMessage = result && typeof result === "object" &&
          "error" in result && typeof result.error === "string"
          ? result.error
          : "The fictional character couldn't reply just now.";
        throw new Error(errorMessage);
      }

      const reply: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: result.reply,
        createdAt: new Date().toISOString(),
      };
      setChats((current) => ({ ...current, [profileId]: [...(current[profileId] ?? []), reply] }));
      setChatMode(result.mode);
      notify(`Your AI match replied: ${character.name}.`, profileId, "reply");
    } catch (error) {
      console.error("Could not retrieve a fictional AI chat reply.", error);
      setToast(error instanceof Error ? error.message : "The fictional character couldn't reply just now.");
    } finally {
      if (opening) openingChats.current.delete(profileId);
      setChatLoading(false);
    }
  }, [notify]);

  function navigate(next: View) {
    setView(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function begin() {
    if (!profile) {
      setShowRegistration(true);
      return;
    }
    navigate(completed ? "dashboard" : "quiz");
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const birthDate = String(form.get("birthDate") ?? "");
    const gender = String(form.get("gender") ?? "");
    const preferredGender = String(form.get("preferredGender") ?? "Everyone") as Preference;
    if (!name || !birthDate || !gender) {
      setRegistrationError("Please add your name, birthday and gender to get started.");
      return;
    }
    if (ageFromDate(birthDate) < 18) {
      setRegistrationError("Luna's Matrimony is for adults 18 and over. Come back when you're 18.");
      return;
    }
    const newProfile: MemberProfile = {
      name,
      birthDate,
      gender,
      preferredGender,
      location: String(form.get("location") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      petPreference,
      photo: profilePhoto ?? profile?.photo,
    };
    setProfile(newProfile);
    setGenderFilter(preferredGender);
    setRegistrationError("");
    setShowRegistration(false);
    setView("quiz");
    setQuestionIndex(0);
    setToast(`Luna says, “Well hello, ${name.split(" ")[0]}! Let's find your kind of wonderful.”`);
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      setRegistrationError("Please choose an image under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfilePhoto(reader.result);
    };
    reader.onerror = () => setRegistrationError("We couldn't read that photo. Please try another.");
    reader.readAsDataURL(file);
  }

  function chooseAnswer(optionIndex: number) {
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  function nextQuestion() {
    if (answers[questionIndex] === undefined) {
      setToast("Pick an answer first — Luna is very curious.");
      return;
    }
    if (questionIndex === quizQuestions.length - 1) {
      if (answers.length !== quizQuestions.length || answers.some((answer) => answer === undefined)) {
        setToast("Almost there! Answer every question to see your results.");
        return;
      }
      navigate("dashboard");
      const winner = people
        .filter((person) => genderFilter === "Everyone" || genderFilter === (person.gender === "woman" ? "Women" : "Men"))
        .map((person) => ({ person, match: scoreMatch(answers, quizQuestions, person.tags) }))
        .sort((a, b) => b.match.percentage - a.match.percentage)[0];
      if (winner) {
        notify(`You have a new fictional match! Your compatibility with ${winner.person.name} is ${winner.match.percentage}%.`, winner.person.id, "match");
      }
      if (winner && winner.match.percentage >= 80) {
        setConfettiActive(true);
        window.setTimeout(() => setConfettiActive(false), 2600);
        window.setTimeout(() => setToast("A lovely connection is in the stars ✨"), 500);
      }
      else if (!winner) setToast("Your personality is ready to meet its matches.");
      return;
    }
    setQuestionIndex((current) => current + 1);
  }

  function retakeQuiz() {
    setAnswers([]);
    setQuestionIndex(0);
    navigate("quiz");
  }

  function toggleLiked(person: DemoMember) {
    if (liked.includes(person.id)) {
      setLiked((current) => current.filter((id) => id !== person.id));
      setToast(`${person.name} removed from your liked profiles.`);
      return;
    }
    setLiked((current) => [...current, person.id]);
    setPassed((current) => current.filter((id) => id !== person.id));
    notify(`You liked ${person.name}!`, person.id, "liked");
    openChat(person);
  }

  function openChat(person: DemoMember) {
    setActiveChatId(person.id);
    navigate("chat");
    if (!chats[person.id]?.length) {
      void requestChatReply(person.id, []);
    }
  }

  function sendChatMessage(content: string) {
    if (!activeChatId || chatLoading) return;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const history = [...(chats[activeChatId] ?? []), userMessage];
    setChats((current) => ({ ...current, [activeChatId]: history }));
    void requestChatReply(activeChatId, history.slice(-20).map(({ role, content: text }) => ({ role, content: text })));
  }

  function swipe(person: DemoMember, action: "like" | "pass" | "favourite") {
    if (action === "like") toggleLiked(person);
    if (action === "pass") {
      setPassed((current) => current.includes(person.id) ? current : [...current, person.id]);
      setLiked((current) => current.filter((id) => id !== person.id));
      setToast(`${person.name} moved to your passed profiles.`);
    }
    if (action === "favourite") {
      setLiked((current) => current.includes(person.id) ? current : [...current, person.id]);
      setFavourites((current) => current.includes(person.id) ? current : [...current, person.id]);
      setPassed((current) => current.filter((id) => id !== person.id));
      if (!liked.includes(person.id)) {
        notify(`You liked ${person.name}! They are now in your favourites.`, person.id, "liked");
        openChat(person);
      } else {
        setToast(`${person.name} is already in your favourites and likes.`);
      }
    }
  }

  function toggleCelebrityFavourite(name: string) {
    const selected = favourites.includes(name);
    setFavourites((current) => selected ? current.filter((item) => item !== name) : [...current, name]);
    setToast(`${name} ${selected ? "removed from" : "added to"} your entertainment favourites.`);
  }

  function openProfile(kind: "person" | "celebrity" | "pet", value: DemoMember | Celebrity | Pet) {
    setActiveProfile({ kind, value });
  }

  function openNotification(notification: LocalNotification) {
    setNotificationCount(0);
    const person = people.find((item) => item.id === notification.profileId);
    if (!person) {
      setToast("This older notification doesn't link to a profile.");
      return;
    }
    if (notification.kind === "match") {
      navigate("discover");
      openProfile("person", person);
      return;
    }
    openChat(person);
  }

  const quizQuestion = quizQuestions[questionIndex];
  const currentAnswer = answers[questionIndex];
  const activeChatProfile = people.find((person) => person.id === activeChatId);
  const visiblePets = pets.filter((pet) => {
    if (petPreference === "Neither") return false;
    if (petPreference === "Both") return true;
    return pet.kind === petPreference.toLowerCase();
  });

  return (
    <main className={dark ? "app dark" : "app"}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Luna's Matrimony home">
          <LunaMark small /><span>LUNA&apos;S <b>MATRIMONY</b></span>
        </button>
        <button className="mobile-menu-button" onClick={() => setMobileMenu((open) => !open)} aria-label="Toggle navigation"><ChevronDown size={20} /></button>
        <nav className={`topnav${mobileMenu ? " topnav-open" : ""}`} aria-label="Main navigation">
          <button className={view === "home" ? "nav-link selected" : "nav-link"} onClick={() => navigate("home")}>Home</button>
          <button className="nav-link" onClick={begin}>Find my match</button>
          <button className="nav-link" onClick={() => {
            if (!profile) setShowRegistration(true);
            else navigate(completed ? "discover" : "quiz");
          }}>AI matches</button>
          <button className="nav-link" onClick={() => navigate("celebrities")}>Celebrity fun</button>
          <button className="nav-link" onClick={() => navigate("pets")}>Pet matches</button>
          {profile && <button className="nav-link" onClick={() => navigate("dashboard")}>My space</button>}
          {profile && liked.length > 0 && <button className="nav-link" onClick={() => {
            const person = people.find((item) => item.id === activeChatId) ?? people.find((item) => liked.includes(item.id));
            if (person) openChat(person);
          }}>AI chat</button>}
          {profile && <button className="nav-link" onClick={() => navigate("liked")}>My likes{liked.length > 0 && <span className="nav-count">{liked.length}</span>}</button>}
          {profile && <button className="nav-link" onClick={() => navigate("history")}>History</button>}
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-toggle" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? "light" : "dark"} mode`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {profile ? (
            <button className="profile-chip" onClick={() => navigate("dashboard")}><span className="avatar-mini">{profile.photo ? <Image src={profile.photo} alt="" fill sizes="34px" /> : initials(profile.name)}</span><span>{profile.name.split(" ")[0]}</span></button>
          ) : <button className="button button-outline button-small" onClick={() => setShowRegistration(true)}>Sign in <ArrowUpRight size={14} /></button>}
          {profile && <button className="icon-button notification-button" aria-label={`${notificationCount} notifications`} onClick={() => { setNotificationCount(0); navigate("notifications"); }}><Bell size={18} />{notificationCount > 0 && <span className="notification-dot">{notificationCount > 9 ? "9+" : notificationCount}</span>}</button>}
        </div>
      </header>

      {view === "home" && <section className="hero page-wrap">
        <div className="hero-copy">
          <div className="hero-overline"><span className="overline-line" /> LUNA&apos;S MATRIMONY</div>
          <h1>Your soulmate might be <em>one quiz</em> away.</h1>
          <p className="hero-intro">Finding your kind of crazy, one swipe at a time. Forget the small talk and meet the people who get your wonderfully weird.</p>
          <div className="hero-buttons">
            <button className="button button-plum" onClick={begin}>Find my match <ArrowRight size={18} /></button>
            <button className="button button-quiet" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works <ArrowDown size={17} /></button>
            <button className="button button-quiet hero-celebrity-link" onClick={() => navigate("celebrities")}>Meet our celebrities <Sparkles size={16} /></button>
          </div>
          <div className="hero-footnote"><span className="tiny-heart">♥</span> A 40-question personality quiz, with absolutely no boring questions.</div>
          <div className="hero-people">
            <div className="avatar-stack"><span>M</span><span>L</span><span>A</span><span>R</span></div>
            <p><b>A little more you.</b><br />A little less swipe fatigue.</p>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of Luna the cat and her dog friend">
          <div className="hero-sticker sticker-top">made for your kind of love <Heart size={13} fill="currentColor" /></div>
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <span className="sparkle sparkle-a">✦</span><span className="sparkle sparkle-b">✧</span><span className="sparkle sparkle-c">✧</span><span className="heart-float heart-a">♥</span><span className="heart-float heart-b">♥</span>
          <div className="hero-moon"><span>✦</span></div>
          <div className="cat-illustration">
            <i className="illustration-ear left" /><i className="illustration-ear right" />
            <div className="cat-head"><i className="cat-eye eye-left" /><i className="cat-eye eye-right" /><i className="cat-blush blush-left" /><i className="cat-blush blush-right" /><i className="cat-nose" /><i className="whisker whisker-left" /><i className="whisker whisker-right" /></div>
            <span className="cat-bow">✿</span><span className="cat-collar">✦</span>
          </div>
          <div className="dog-illustration"><i className="dog-ear ear-left" /><i className="dog-ear ear-right" /><div className="dog-head"><i className="dog-eye eye-left" /><i className="dog-eye eye-right" /><i className="dog-nose" /><i className="dog-patch" /></div><span className="dog-collar" /></div>
          <div className="hero-sticker sticker-bottom"><span>♡</span> Luna says: “You seem lovely.”</div>
        </div>
        <div className="hero-side-caption">A softer way<br />to find your person <span>↘</span></div>
      </section>}

      {view === "home" && <section className="how-section page-wrap" id="how-it-works">
        <div className="section-heading">
          <Label>THE LUNA METHOD</Label>
          <h2>Less swiping. <em>More feeling.</em></h2>
          <p>A little personality, a lot of possibility.</p>
        </div>
        <div className="steps-grid">
          {[{ number: "01", title: "Meet yourself", text: "Take 40 playful questions that get to the real you.", icon: "✦" }, { number: "02", title: "Find your rhythm", text: "See compatibility built from your actual answers.", icon: "♡" }, { number: "03", title: "Make it a story", text: "Meet thoughtful demo profiles, celebrity lookalikes, and pets.", icon: "✿" }].map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><span className="step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
        </div>
      </section>}

      {view === "quiz" && profile && <section className="quiz-page page-wrap">
        <button className="back-link" onClick={() => navigate("dashboard")}><ArrowLeft size={16} /> Back to my space</button>
        <div className="quiz-shell">
          <div className="quiz-heading"><Label>A NOTE FROM LUNA</Label><h1>Tell me a little <em>about you.</em></h1><p>No wrong answers. (Except saying pineapple doesn&apos;t belong on pizza. Kidding. Mostly.)</p></div>
          <div className="quiz-card">
            <div className="quiz-card-top"><span className="question-count">QUESTION <b>{String(questionIndex + 1).padStart(2, "0")}</b><span> / 40</span></span><span className="question-category">{quizQuestion.category}</span></div>
            <div className="progress-track"><motion.div className="progress-fill" animate={{ width: `${((questionIndex + (currentAnswer !== undefined ? 1 : 0)) / quizQuestions.length) * 100}%` }} transition={{ duration: 0.35 }} /></div>
            <AnimatePresence mode="wait"><motion.div key={questionIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="question-content">
              <h2>{quizQuestion.prompt}</h2>
              <div className="answer-grid">
                {quizQuestion.options.map((answer, index) => <button key={answer.label} className={`answer-option${currentAnswer === index ? " answer-selected" : ""}`} onClick={() => chooseAnswer(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{answer.label}</span>{currentAnswer === index && <Check size={17} className="answer-check" />}</button>)}
              </div>
            </motion.div></AnimatePresence>
            <div className="quiz-footer"><button className="button button-quiet" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}><ArrowLeft size={17} /> Previous</button><span className="quiz-save-note"><Sparkles size={14} /> Your answers save as you go</span><button className="button button-plum" onClick={nextQuestion}>{questionIndex === quizQuestions.length - 1 ? "See my results" : "Next question"} <ArrowRight size={17} /></button></div>
          </div>
          <p className="quiz-reassurance"><Heart size={14} /> Your quiz is private and saved on this device.</p>
        </div>
      </section>}

      {view === "dashboard" && profile && <section className="dashboard-page page-wrap">
        <div className="dashboard-greeting"><div><Label>YOUR LITTLE CORNER OF THE WORLD</Label><h1>Hello, {profile.name.split(" ")[0]} <span className="hello-sparkle">✦</span></h1><p>{completed ? "Luna has been thinking about you. Here's where to start." : "Let's get to know you — your first match is one little quiz away."}</p></div><button className="button button-outline" onClick={retakeQuiz}><Undo2 size={16} /> {completed ? "Retake quiz" : "Take the quiz"}</button></div>
        {completed ? <div className="dashboard-grid">
          <article className="dash-card personality-card"><div className="dash-card-top"><Label>YOUR PERSONALITY</Label><span className="dash-mini-icon">✿</span></div><h2>{answerSummary(answers, quizQuestions).split(" — ")[0]}</h2><p>{answerSummary(answers, quizQuestions).split(" — ")[1]}</p><button className="text-link" onClick={() => navigate("quiz")}>Explore my answers <ArrowRight size={15} /></button></article>
          <article className="dash-card match-card"><div className="dash-card-top"><Label>TODAY&apos;S LITTLE POSSIBILITY</Label><span className="match-score">{bestMatch.match.percentage}% <Heart size={13} fill="currentColor" /></span></div><div className="best-match-info"><MemberPortrait profile={bestMatch.person} className="dashboard-match-portrait" /><div><h2>{bestMatch.person.name}, {bestMatch.person.age}</h2><span>{bestMatch.person.city}</span></div></div><p>{bestMatch.person.intro}</p><div className="tag-row">{bestMatch.match.shared.length ? bestMatch.match.shared.map((tag) => <span className="soft-tag" key={tag}>{tag}</span>) : <span className="soft-tag">a fresh start</span>}</div><button className="text-link" onClick={() => openProfile("person", bestMatch.person)}>See why you click <ArrowRight size={15} /></button></article>
          <article className="dash-card quick-links"><Label>YOUR NEXT LITTLE ADVENTURE</Label><h2>Find your kind of wonderful.</h2><div className="quick-link-list"><button onClick={() => navigate("discover")}><span className="quick-icon"><Heart size={17} /></span><span><b>Meet your people</b><small>Explore thoughtful matches</small></span><ArrowRight size={16} /></button><button onClick={() => navigate("liked")}><span className="quick-icon"><HeartHandshake size={17} /></span><span><b>Your liked profiles</b><small>{liked.length} saved in this browser</small></span><ArrowRight size={16} /></button><button onClick={() => navigate("history")}><span className="quick-icon peach"><Undo2 size={17} /></span><span><b>Match history</b><small>{passed.length} passed · {liked.length} liked</small></span><ArrowRight size={16} /></button><button onClick={() => { setNotificationCount(0); navigate("notifications"); }}><span className="quick-icon lilac"><Bell size={17} /></span><span><b>Notifications</b><small>{notifications.length ? `${notifications.length} local updates` : "All quiet, for now"}</small></span><ArrowRight size={16} /></button><button onClick={() => navigate("celebrities")}><span className="quick-icon lilac"><Sparkles size={17} /></span><span><b>Celebrity daydreams</b><small>Just for fun, always fictional</small></span><ArrowRight size={16} /></button><button onClick={() => navigate("pets")}><span className="quick-icon peach"><PawPrint size={17} /></span><span><b>Meet a furry friend</b><small>Find your pet personality</small></span><ArrowRight size={16} /></button></div></article>
          <article className="dash-card profile-card"><div className="dash-card-top"><Label>MY PROFILE</Label><button className="text-link" onClick={() => navigate("settings")}>Edit <ArrowUpRight size={14} /></button></div><div className="profile-info"><span className="avatar-large">{profile.photo ? <Image src={profile.photo} alt="" fill sizes="64px" /> : initials(profile.name)}</span><div><h3>{profile.name}, {ageFromDate(profile.birthDate)}</h3><span>{profile.location || "Location is a little mystery"}</span></div></div><p>{profile.description || "A little mystery, a lot of possibility. Add a few words about you."}</p><div className="profile-meta"><span><span className="online-dot" />Profile ready</span><button onClick={() => navigate("settings")}>Settings <ArrowRight size={14} /></button></div></article>
        </div> : <div className="empty-start-card"><div className="empty-icon"><Sparkles size={24} /></div><div><h2>Your story starts with 40 little questions.</h2><p>We turn your answers into a real compatibility score — no random numbers, just shared sparks.</p></div><button className="button button-plum" onClick={() => { setQuestionIndex(0); navigate("quiz"); }}>Start my quiz <ArrowRight size={17} /></button></div>}
        </section>}

      {view === "discover" && <section className="discover-page page-wrap">
        <div className="page-title-row"><div><Label>{people.length} ORIGINAL AI CHARACTERS</Label><h1>Meet your AI <em>matches.</em></h1><p>Fictional adult characters, ranked by your answers. Likes unlock a clearly simulated character chat.</p></div><div className="match-day-badge"><span>✦</span> {completed ? `Top ${Math.min(10, personMatches.length)} ranked from your quiz` : "Take the quiz for personal matches"}</div></div>
        <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find someone by name…" /></label><label className="filter-select"><span>Show me</span><select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)}><option>Everyone</option><option>Women</option><option>Men</option></select></label><label className="score-filter"><span>At least <b>{minimumScore}%</b></span><input type="range" min="0" max="90" step="5" value={minimumScore} onChange={(event) => setMinimumScore(Number(event.target.value))} /></label></div>
        {nextSwipe && <SwipeDeck profile={nextSwipe.person} percentage={nextSwipe.match.percentage} shared={nextSwipe.match.shared} ready={completed} onAction={(action) => swipe(nextSwipe.person, action)} onDetails={() => openProfile("person", nextSwipe.person)} />}
        <div className="people-grid">{visiblePersonMatches.map(({ person, match }, index) => <motion.article className="person-card" key={person.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }}><button className="person-photo" style={{ background: person.colour }} onClick={() => openProfile("person", person)} aria-label={`View ${person.name}'s profile`}><MemberPortrait profile={person} className="person-portrait" /><span className="match-pill">{completed ? `${match.percentage}% match` : "Take quiz to match"}</span><span className="card-open"><ArrowUpRight size={17} /></span></button><div className="person-card-content"><span className="profession">FICTIONAL AI · {person.profession}</span><div className="person-name-row"><h3>{person.name}, {person.age}</h3><button className={`heart-button${liked.includes(person.id) ? " liked" : ""}`} onClick={() => toggleLiked(person)} aria-label={`${liked.includes(person.id) ? "Unlike" : "Like"} ${person.name}`}><Heart size={19} fill={liked.includes(person.id) ? "currentColor" : "none"} /></button></div><span className="person-city">{person.city}</span><p>{person.intro}</p><div className="tag-row">{completed ? match.shared.slice(0, 3).map((tag) => <span className="soft-tag" key={tag}>{tag}</span>) : <span className="soft-tag">Quiz to see shared interests</span>}</div><div className="card-actions"><button onClick={() => swipe(person, "pass")}><X size={15} /> Pass</button><button onClick={() => openProfile("person", person)}>View profile <ArrowRight size={15} /></button></div></div></motion.article>)}</div>
        {!showAllMatches && personMatches.length > 10 && <button className="button button-outline load-more-button" onClick={() => setShowAllMatches(true)}>Explore all {personMatches.length} AI characters <ArrowDown size={15} /></button>}
        {!personMatches.length && <div className="no-results"><Sparkles size={24} /><h3>{passed.length ? "You've seen everyone in this demo." : "No one by that name (yet)."}</h3><p>{passed.length ? "Your passed profiles are saved in match history." : "Try clearing the search or lowering your match threshold."}</p>{passed.length > 0 && <button className="button button-outline" onClick={() => navigate("history")}>View match history <ArrowRight size={15} /></button>}</div>}
        <p className="fictional-note"><span>ⓘ</span> All {people.length} adults are fictional AI characters. Their portraits are synthetic images bundled with this demo. Likes and chats are local simulations; no real person is contacted.</p>
      </section>}

      {view === "chat" && activeChatProfile && <FictionalChat
        profile={activeChatProfile}
        messages={chats[activeChatProfile.id] ?? []}
        loading={chatLoading}
        mode={chatMode}
        onBack={() => navigate("discover")}
        onSend={sendChatMessage}
      />}

      {view === "celebrities" && <section className="celeb-page page-wrap">
        <div className="page-title-row"><div><Label>THE DAYDREAM CLUB</Label><h1>Who&apos;s your <em>celebrity crush?</em></h1><p>A personality-inspired compatibility game. Always fictional, never an actual match.</p></div><span className="celeb-count"><Sparkles size={16} /> 40 just-for-fun profiles</span></div>
        <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a celebrity…" /></label><label className="filter-select"><span>Show me</span><select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)}><option>Everyone</option><option>Women</option><option>Men</option></select></label><label className="score-filter"><span>At least <b>{minimumScore}%</b></span><input type="range" min="0" max="90" step="5" value={minimumScore} onChange={(event) => setMinimumScore(Number(event.target.value))} /></label></div>
        <div className="celebrity-grid">{celebMatches.slice(0, visibleCelebrityCount).map(({ celebrity, match }, index) => <motion.article className="celebrity-card" key={celebrity.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index < 10 ? index * 0.035 : 0 }}><div className="celebrity-image" style={{ background: celebrity.accent }}><Portrait name={celebrity.name} colour={celebrity.accent} /><span className="match-pill">{completed ? `${match.percentage}%` : "Take quiz"}</span><button className={`celebrity-heart${favourites.includes(celebrity.name) ? " liked" : ""}`} onClick={() => toggleCelebrityFavourite(celebrity.name)} aria-label={`${favourites.includes(celebrity.name) ? "Remove" : "Add"} ${celebrity.name} ${favourites.includes(celebrity.name) ? "from" : "to"} favourites`}><Heart size={18} fill={favourites.includes(celebrity.name) ? "currentColor" : "none"} /></button></div><div className="celebrity-card-content"><span className="profession">{celebrity.profession}</span><h3>{celebrity.name}</h3><p>{celebrity.description}</p><div className="tag-row">{completed ? match.shared.slice(0, 3).map((tag) => <span className="soft-tag" key={tag}>{tag}</span>) : <span className="soft-tag">Quiz for shared interests</span>}</div><button className="text-link" onClick={() => openProfile("celebrity", celebrity)}>{completed ? "Your compatibility" : "See profile"} <ArrowRight size={14} /></button></div></motion.article>)}</div>
        {celebMatches.length > visibleCelebrityCount && <button className="button button-outline load-more-button" onClick={() => setVisibleCelebrityCount((count) => Math.min(count + 10, celebMatches.length))}>Show {Math.min(10, celebMatches.length - visibleCelebrityCount)} more profiles <ArrowDown size={15} /></button>}
        {celebMatches.length === 0 && <div className="no-results"><Sparkles size={24} /><h3>No matches for those filters.</h3><p>Try a different name or a lower compatibility score.</p></div>}
        <div className="entertainment-disclaimer"><Sparkles size={17} /><p><b>Just a daydream.</b> This is fictional compatibility entertainment, not an actual romantic match, endorsement, or connection. Portraits load from Wikimedia Commons only when a freely reusable license is available; each portrait links to its source, creator credit, and license details.</p></div>
      </section>}

      {view === "pets" && <section className="pets-page page-wrap">
        <div className="page-title-row"><div><Label>VERY GOOD COMPANIONS</Label><h1>Your kind of <em>fur-ever friend.</em></h1><p>A fluffy little compatibility check, with no awkward first dates.</p></div><span className="paw-doodle">♡</span></div>
        <div className="pet-preference-bar"><div><b>What kind of pet person are you?</b><span>This helps Luna find your most tail-wagging match.</span></div><div className="preference-pills">{(["Cats", "Dogs", "Both", "Neither"] as PetPreference[]).map((choice) => <button key={choice} onClick={() => { setPetPreference(choice); if (profile) setProfile({ ...profile, petPreference: choice }); }} className={petPreference === choice ? "preference-active" : ""}>{choice === "Cats" ? "🐈" : choice === "Dogs" ? "🐕" : choice === "Neither" ? "🌿" : "🐾"} {choice}</button>)}</div></div>
        {petPreference === "Neither" ? <div className="no-results pet-no-results"><span>🌿</span><h3>Pet-free and perfectly you.</h3><p>Luna thinks it&apos;s lovely to know what feels right for your home.</p></div> : <div className="pet-grid">{visiblePets.map((pet) => {
          const preferenceBonus = petPreference === "Both" ? 4 : pet.kind === petPreference.toLowerCase() ? 10 : -6;
          const quizScore = completed ? scoreMatch(answers, quizQuestions, pet.tags).percentage : 62 + pet.tags.filter((tag) => userTags.includes(tag)).length * 7;
          const petScore = Math.max(0, Math.min(98, quizScore + preferenceBonus));
          return <article className="pet-card" key={pet.name}><button className="pet-photo" onClick={() => openProfile("pet", pet)} aria-label={`View ${pet.name}'s profile`}><Image src={`https://images.unsplash.com/${pet.image}?auto=format&fit=crop&w=700&q=80`} alt={`${pet.type}, ${pet.name}`} fill sizes="(max-width: 700px) 90vw, 300px" unoptimized /><span className="pet-type">{pet.kind === "cat" ? "🐈" : "🐕"} {pet.type}</span></button><div className="pet-card-body"><div className="pet-card-heading"><h3>{pet.name}</h3><span className="pet-score">{petScore}% <Heart size={13} fill="currentColor" /></span></div><p>{pet.description}</p><div className="tag-row">{pet.tags.slice(0, 2).map((tag) => <span className="soft-tag" key={tag}>{tag}</span>)}</div><button className="text-link" onClick={() => openProfile("pet", pet)}>Meet {pet.name} <ArrowRight size={14} /></button></div></article>;
        })}</div>}
        <p className="fictional-note"><span>ⓘ</span> These are adorable fictional pet profiles for entertainment. Photos from Unsplash.</p>
      </section>}

      {view === "liked" && <section className="liked-page page-wrap"><div className="page-title-row"><div><Label>THE ONES THAT CAUGHT YOUR EYE</Label><h1>Your little <em>love list.</em></h1><p>Saved on this device. No likes or messages are sent to real people.</p></div><span className="liked-total"><Heart fill="currentColor" size={16} /> {liked.length} likes · {favourites.length} favourites</span></div>
        {liked.length ? <div className="people-grid">{liked.map((id) => {
          const person = people.find((item) => item.id === id);
          if (!person) return null;
          const match = scoreMatch(answers, quizQuestions, person.tags);
          return <article className="person-card" key={id}><button className="person-photo" style={{ background: person.colour }} onClick={() => openProfile("person", person)}><MemberPortrait profile={person} className="person-portrait" /><span className="match-pill">{completed ? `${match.percentage}% match` : "Take quiz to match"}</span></button><div className="person-card-content"><div className="person-name-row"><h3>{person.name}, {person.age}</h3><button className="heart-button liked" onClick={() => toggleLiked(person)} aria-label={`Unlike ${person.name}`}><Heart size={19} fill="currentColor" /></button></div><span className="person-city">{person.city}</span><p>{person.intro}</p><div className="tag-row">{completed ? match.shared.slice(0, 3).map((tag) => <span className="soft-tag" key={tag}>{tag}</span>) : <span className="soft-tag">Quiz for shared interests</span>}</div><button className="text-link" onClick={() => openProfile("person", person)}>View profile <ArrowRight size={14} /></button></div></article>;
        })}</div> : <div className="no-results"><Heart size={25} /><h3>Your love list is a blank canvas.</h3><p>Explore your demo matches and tap a heart to save a profile.</p><button className="button button-plum" onClick={() => navigate("discover")}>Meet your people <ArrowRight size={16} /></button></div>}
        {!!passed.length && <details className="passed-list"><summary>Passed profiles <span>{passed.length}</span></summary><div>{passed.map((id) => people.find((person) => person.id === id)?.name).filter(Boolean).join(" · ")}</div><button onClick={() => { setPassed([]); setToast("Your passed profiles have been cleared."); }}>Clear history</button></details>}
      </section>}

      {view === "history" && <section className="liked-page page-wrap"><div className="page-title-row"><div><Label>YOUR JOURNEY, YOUR CALL</Label><h1>A little <em>match history.</em></h1><p>Likes and passes from your local demo. You can change your mind any time.</p></div><span className="liked-total"><Heart size={16} /> {historyItems.length} profile interactions</span></div>
        {historyItems.length ? <div className="history-list">{historyItems.map(({ id, status }) => {
          const person = people.find((item) => item.id === id);
          if (!person) return null;
          const match = scoreMatch(answers, quizQuestions, person.tags);
          return <article className="history-item" key={`${id}-${status}`}><MemberPortrait profile={person} className="history-avatar" /><div className="history-person"><b>{person.name}, {person.age}</b><span>{person.city}</span></div><span className={`history-status${status === "Liked" ? " history-liked" : ""}`}>{status === "Liked" ? "♥" : "×"} {status}</span>{completed && <span className="history-score">{match.percentage}%</span>}<button className="text-link" onClick={() => openProfile("person", person)}>View profile <ArrowRight size={14} /></button></article>;
        })}</div> : <div className="no-results"><Heart size={24} /><h3>Your story is just beginning.</h3><p>Swipe through fictional demo profiles and your choices will show up here.</p><button className="button button-plum" onClick={() => navigate("discover")}>Discover profiles <ArrowRight size={16} /></button></div>}
        <p className="fictional-note"><span>ⓘ</span> These profiles are fictional and this activity is only stored in your browser.</p>
      </section>}

      {view === "notifications" && <section className="liked-page page-wrap">
        <div className="page-title-row"><div><Label>A LITTLE NOTE FROM LUNA</Label><h1>Your <em>notifications.</em></h1><p>Updates about your fictional AI matches, likes, and simulated replies.</p></div>{notifications.length > 0 && <button className="button button-outline" onClick={() => { setNotifications([]); setNotificationCount(0); }}>Clear all</button>}</div>
        {notifications.length ? <div className="history-list">{notifications.map((notification) => <button className="notification-item notification-clickable" key={notification.id} onClick={() => openNotification(notification)}><span className="quick-icon"><Heart size={17} /></span><span className="notification-copy"><b>{notification.kind === "reply" ? "Your AI match replied" : notification.kind === "liked" ? "You liked a fictional character" : "A new fictional match"}</b><span>{notification.text}</span></span><time className="notification-local" dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time><ArrowRight size={15} /></button>)}</div> : <div className="no-results"><Bell size={24} /><h3>All quiet. Luna left you a heart.</h3><p>Your quiz matches and simulated character replies will appear here.</p><button className="button button-outline" onClick={() => navigate("dashboard")}>Back to my space <ArrowRight size={16} /></button></div>}
        <p className="fictional-note"><span>ⓘ</span> Notifications are local simulations. No real person receives a like or message.</p>
      </section>}

      {view === "settings" && profile && <section className="settings-page page-wrap"><button className="back-link" onClick={() => navigate("dashboard")}><ArrowLeft size={16} /> Back to my space</button><div className="settings-card"><Label>YOUR ACCOUNT, YOUR WAY</Label><h1>Settings <em>& little details.</em></h1><p>Your demo profile stays in this browser only.</p><div className="settings-item"><span><b>Theme</b><small>Make Luna&apos;s world feel like yours</small></span><button className="button button-outline" onClick={() => setDark((value) => !value)}>{dark ? <Sun size={16} /> : <Moon size={16} />}{dark ? "Light mode" : "Dark mode"}</button></div><div className="settings-item"><span><b>My match preference</b><small>Who should appear in your demo matches?</small></span><select value={profile.preferredGender} onChange={(event) => { const selected = event.target.value as Preference; setProfile({ ...profile, preferredGender: selected }); setGenderFilter(selected); }}><option>Everyone</option><option>Women</option><option>Men</option></select></div><div className="settings-item"><span><b>Pet preference</b><small>Choose the profiles you&apos;ll see</small></span><select value={petPreference} onChange={(event) => { const selected = event.target.value as PetPreference; setPetPreference(selected); setProfile({ ...profile, petPreference: selected }); }}><option>Cats</option><option>Dogs</option><option>Both</option><option>Neither</option></select></div><div className="settings-item"><span><b>My personality description</b><small>{profile.description || "A little mystery. Add yours during profile setup."}</small></span><button className="button button-outline" onClick={() => { setShowRegistration(true); setRegistrationError("Update your profile details below."); }}>Edit profile</button></div><div className="settings-item reset-item"><span><b>Start over</b><small>Remove your profile and saved demo matches from this device</small></span><button className="button button-outline danger-button" onClick={() => { if (!window.confirm("Clear your local demo profile, quiz, and saved matches?")) return; localStorage.removeItem(storageKey); setProfile(null); setAnswers([]); setLiked([]); setPassed([]); setFavourites([]); setView("home"); setToast("Your local demo has been cleared."); }}>Clear my demo</button></div></div></section>}

      {view === "home" && <section className="celebrity-teaser page-wrap"><div><Label>YOUR FAVOURITE DAYDREAMS</Label><h2>First dates with <em>famous faces?</em></h2><p>See who your personality clicks with. All fictional. All in good fun.</p><button className="button button-outline" onClick={() => navigate("celebrities")}>Meet the celebrities <ArrowRight size={16} /></button></div><div className="teaser-orbit"><span>✧</span><span>♥</span><div><Sparkles size={29} /></div><span>✦</span></div></section>}

      <footer className="footer page-wrap"><div className="footer-brand"><LunaMark small /><span>LUNA&apos;S MATRIMONY</span></div><span>Finding your kind of crazy, one swipe at a time.</span><span className="footer-legal">A playful local demo · 18+ · No real users or messages</span></footer>

      <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} role="status"><span className="toast-icon">✦</span>{toast}<button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={16} /></button></motion.div>}</AnimatePresence>
      <AnimatePresence>{confettiActive && <motion.div className="confetti-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <span key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 6) * 0.09}s` }}>{["✦", "♥", "✧", "♡"][index % 4]}</span>)}</motion.div>}</AnimatePresence>

      <AnimatePresence>{showRegistration && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowRegistration(false); setRegistrationError(""); } }}><motion.section className="registration-modal" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true" aria-labelledby="registration-title"><button className="modal-close" onClick={() => { setShowRegistration(false); setRegistrationError(""); }} aria-label="Close"><X size={20} /></button><div className="registration-mascot"><LunaMark /></div><Label>BEFORE WE BEGIN</Label><h2 id="registration-title">Hello, you. <em>Who are you?</em></h2><p>Just the basics. Your details stay on this device in this demo.</p>{registrationError && <p className="form-error" role="alert">{registrationError}</p>}<form onSubmit={submitRegistration}><label className="form-label">Your name<input required autoComplete="name" name="name" placeholder="What should Luna call you?" defaultValue={profile?.name} /></label><div className="form-row"><label className="form-label">Date of birth<input required name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={profile?.birthDate} /></label><label className="form-label">Your gender<select required name="gender" defaultValue={profile?.gender ?? ""}><option value="" disabled>Choose one</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer to self-describe</option><option>Prefer not to say</option></select></label></div><label className="form-label">I&apos;d like to meet<select name="preferredGender" defaultValue={profile?.preferredGender ?? "Everyone"}><option>Everyone</option><option>Women</option><option>Men</option></select></label><div className="form-row"><label className="form-label">Where are you? <span>(optional)</span><input name="location" placeholder="City, country" defaultValue={profile?.location} /></label><label className="form-label">A little about you<input required name="description" placeholder="The short version of your lovely self" defaultValue={profile?.description} /></label></div><label className="form-label photo-input-label">Profile photo <span>(optional, max 1 MB)</span><input accept="image/*" type="file" onChange={handlePhoto} /><small>{profilePhoto ? "Lovely! Your photo is ready." : "An image you choose stays right here in your browser."}</small></label><button className="button button-plum registration-submit" type="submit">That&apos;s me — let&apos;s go <ArrowRight size={17} /></button><span className="age-note">♡ For adults 18 and over. No account or real messages in this demo.</span></form></motion.section></div>}</AnimatePresence>

      <AnimatePresence>
        {activeProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveProfile(null); }}>
          <motion.section className="profile-modal" initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} role="dialog" aria-modal="true" aria-label="Profile details">
            <button className="modal-close" onClick={() => setActiveProfile(null)} aria-label="Close profile"><X size={20} /></button>
            {activeProfile.kind === "person" && (() => {
              const person = activeProfile.value as DemoMember;
              const match = scoreMatch(answers, quizQuestions, person.tags);
              return <>
                <div className="detail-avatar" style={{ background: person.colour }}>
                  <MemberPortrait profile={person} className="detail-person-portrait" />
                  <span className="match-pill">{completed ? `${match.percentage}% compatible` : "Take quiz to match"}</span>
                </div>
                <Label>AI-GENERATED FICTIONAL ADULT CHARACTER</Label>
                <h2>{person.name}, {person.age}</h2>
                <p className="detail-subtitle">{person.gender === "woman" ? "Woman" : "Man"} · {person.profession} · {person.location}</p>
                <p>{person.bio}</p>
                <div className="profile-facts">
                  <div><b>Personality</b><span>{person.personality.join(" · ")}</span></div>
                  <div><b>Hobbies</b><span>{person.hobbies.join(" · ")}</span></div>
                  <div><b>Favourite colour</b><span>{person.favoriteColor}</span></div>
                  <div><b>Favourite food</b><span>{person.favoriteFood}</span></div>
                  <div><b>Music</b><span>{person.musicPreferences}</span></div>
                  <div><b>Relationship preferences</b><span>{person.relationshipPreferences}</span></div>
                </div>
                <div className="detail-explanation">
                  <b>Why you click</b>
                  <span>{completed ? (match.shared.length ? `Your answers share a little ${match.shared.join(", ")} energy.` : "A different perspective can be a lovely beginning.") : "Take the quiz to reveal shared interests."}</span>
                  <span>Personality compatibility: {completed ? `${match.personality}%` : "Take the quiz to calculate it"}</span>
                </div>
                <div className="modal-actions">
                  <button className="button button-outline" onClick={() => { swipe(person, "pass"); setActiveProfile(null); }}><X size={16} /> Pass</button>
                  <button className="button button-plum" onClick={() => { toggleLiked(person); setActiveProfile(null); }}><Heart size={16} /> {liked.includes(person.id) ? "Unlike" : "Like & chat"}</button>
                  {liked.includes(person.id) && <button className="button button-outline" onClick={() => { setActiveProfile(null); openChat(person); }}><MessageCircle size={16} /> Chat</button>}
                </div>
                <p className="modal-demo-note">A fictional AI character with a synthetic portrait. The chat is simulated; no real person is contacted.</p>
              </>;
            })()}
            {activeProfile.kind === "celebrity" && (() => {
              const celebrity = activeProfile.value as Celebrity;
              const match = scoreMatch(answers, quizQuestions, celebrity.tags);
              return <>
                <div className="detail-avatar celeb-detail-avatar"><Portrait name={celebrity.name} colour={celebrity.accent} /><span className="match-pill">{completed ? `${match.percentage}% just-for-fun` : "Take quiz to match"}</span></div>
                <Label>FICTIONAL CELEBRITY COMPATIBILITY</Label><h2>{celebrity.name}</h2><p className="detail-subtitle">{celebrity.profession}</p><p>{celebrity.description}</p>
                <div className="detail-explanation"><b>Your shared interests</b><span>{completed ? (match.shared.length ? match.shared.join(" · ") : "Your own unique energy") : "Take the quiz to reveal shared interests."}</span><span>Personality compatibility: {completed ? `${match.personality}%` : "Take the quiz to calculate it"}</span></div>
                <button className="button button-outline modal-wide-button" onClick={() => toggleCelebrityFavourite(celebrity.name)}><Heart size={16} fill={favourites.includes(celebrity.name) ? "currentColor" : "none"} />{favourites.includes(celebrity.name) ? "Saved to favourites" : "Save as a favourite"}</button>
                <p className="modal-demo-note">Entertainment only — not an actual match, endorsement, or connection.</p>
              </>;
            })()}
            {activeProfile.kind === "pet" && (() => {
              const pet = activeProfile.value as Pet;
              const preferenceBonus = petPreference === "Both" ? 4 : pet.kind === petPreference.toLowerCase() ? 10 : -6;
              const percentage = Math.max(0, Math.min(98, (completed ? scoreMatch(answers, quizQuestions, pet.tags).percentage : 62 + pet.tags.filter((tag) => userTags.includes(tag)).length * 7) + preferenceBonus));
              return <>
                <div className="detail-avatar pet-detail-avatar"><Image src={`https://images.unsplash.com/${pet.image}?auto=format&fit=crop&w=700&q=80`} alt={pet.type} fill sizes="350px" unoptimized /><span className="match-pill">{percentage}% kindred spirits</span></div>
                <Label>VERY GOOD COMPANION</Label><h2>{pet.name}</h2><p className="detail-subtitle">{pet.type}</p><p>{pet.description}</p>
                <div className="detail-explanation"><b>What makes you click</b><span>{pet.tags.join(" · ")}</span></div>
                <button className="button button-outline modal-wide-button" onClick={() => { setPetPreference(pet.kind === "cat" ? "Cats" : "Dogs"); setActiveProfile(null); navigate("pets"); setToast(`Luna will show you more ${pet.kind}s.`); }}>Show me more {pet.kind}s <PawPrint size={16} /></button>
                <p className="modal-demo-note">A fictional pet profile for entertainment. Pets are not available for adoption.</p>
              </>;
            })()}
          </motion.section>
        </div>}
      </AnimatePresence>
    </main>
  );
}
