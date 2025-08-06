"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { v4 as uuid } from "uuid";
import imageCompression from "browser-image-compression";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  CollectionReference,
  DocumentData,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useThemeGradient } from "@/lib/useThemeGradient";
import clsx from "clsx";
import { ThemeKey, THEMES } from "@/lib/themes";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

import { type Product } from "@/types/Product";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type MediaType = "image" | "video";

const SITE_KEY = "noasNolife1203";

export default function StaffClient() {
  const [list, setList] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // const [price, setPrice] = useState<number | "">("");
  // const [taxIncluded, setTaxIncluded] = useState(true); // デフォルト税込
  const [progress, setProgress] = useState<number | null>(null);
  const uploading = progress !== null;
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [showKeywordInput, setShowKeywordInput] = useState(false);

  const gradient = useThemeGradient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const isDark = useMemo(() => {
    const darkThemes: ThemeKey[] = ["brandG", "brandH", "brandI"];
    if (!gradient) return false;
    return darkThemes.some((key) => gradient === THEMES[key]);
  }, [gradient]);

  const colRef: CollectionReference = useMemo(
    () => collection(db, "siteStaffs", SITE_KEY, "items"),
    []
  );

  const jaCollator = useMemo(
    () => new Intl.Collator("ja-JP", { numeric: true, sensitivity: "base" }),
    []
  );

  useEffect(() => onAuthStateChanged(auth, (u) => setIsAdmin(!!u)), []);

  useEffect(() => {
    const unsub = onSnapshot(colRef, (snap) => {
      const rows: Product[] = snap.docs.map((d) => {
        const data = d.data() as DocumentData;
        return {
          id: d.id,
          title: data.title,
          body: data.body,
          price: data.price ?? 0,
          mediaURL: data.mediaURL ?? data.imageURL ?? "",
          mediaType: (data.mediaType ?? "image") as MediaType,
          originalFileName: data.originalFileName,
          taxIncluded: data.taxIncluded ?? true,
          order: data.order ?? 9999, // 🔧 ← 追加
        };
      });
      rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      setList(rows);
    });
    return () => unsub();
  }, [colRef, jaCollator]);

  const saveProduct = async () => {
    if (uploading) return;
    if (!title.trim()) return alert("タイトル必須");
    // if (price === "") return alert("価格を入力してください");
    if (formMode === "add" && !file) return alert("メディアを選択してください");

    try {
      const id = editing?.id ?? uuid();
      let mediaURL = editing?.mediaURL ?? "";
      let mediaType: MediaType = editing?.mediaType ?? "image";

      if (formMode === "add" && !file)
        return alert("メディアを選択してください");

      if (file) {
        const isVideo = file.type.startsWith("video/");
        mediaType = isVideo ? "video" : "image";

        const isValidImage =
          file.type === "image/jpeg" || file.type === "image/png";
        const isValidVideo =
          file.type === "video/mp4" || file.type === "video/quicktime";

        if (!isValidImage && !isValidVideo) {
          alert("対応形式：画像（JPEG, PNG）／動画（MP4, MOV）");
          return;
        }

        if (isVideo && file.size > 50 * 1024 * 1024) {
          alert("動画サイズは50MB未満にしてください");
          return;
        }

        const ext = isVideo
          ? file.type === "video/quicktime"
            ? "mov"
            : "mp4"
          : "jpg";

        const uploadFile = isVideo
          ? file
          : await imageCompression(file, {
              maxWidthOrHeight: 1200,
              maxSizeMB: 0.7,
              useWebWorker: true,
              fileType: "image/jpeg",
              initialQuality: 0.8,
            });

        const storageRef = ref(
          getStorage(),
          `products/public/${SITE_KEY}/${id}.${ext}`
        );

        const task = uploadBytesResumable(storageRef, uploadFile, {
          contentType: isVideo ? file.type : "image/jpeg",
        });

        setProgress(0);
        task.on("state_changed", (s) =>
          setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100))
        );
        await task;

        const downloadURL = await getDownloadURL(storageRef);
        if (!downloadURL) throw new Error("画像URLの取得に失敗しました");

        // キャッシュバスターで強制更新
        mediaURL = `${downloadURL}?v=${uuid()}`;
        setProgress(null);

        // 拡張子変更に伴う旧ファイル削除
        if (formMode === "edit" && editing) {
          const oldExt = editing.mediaType === "video" ? "mp4" : "jpg";
          if (oldExt !== ext) {
            await deleteObject(
              ref(getStorage(), `products/public/${SITE_KEY}/${id}.${oldExt}`)
            ).catch(() => {});
          }
        }
      }

      type ProductPayload = {
        title: string;
        body: string;
        // price: number;
        mediaURL: string;
        mediaType: "image" | "video";
        originalFileName?: string;
        // taxIncluded: boolean;
      };

      const payload: ProductPayload = {
        title,
        body,
        // price,
        mediaURL,
        mediaType,
        // taxIncluded,
      };

      // originalFileName があるときだけ追加
      const originalFileName = file?.name || editing?.originalFileName;
      if (originalFileName) {
        payload.originalFileName = originalFileName;
      }

      if (formMode === "edit" && editing) {
        await updateDoc(doc(colRef, id), payload);
      } else {
        await addDoc(colRef, { ...payload, createdAt: serverTimestamp() });
      }

      closeForm();
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。対応形式や容量をご確認ください。");
      setProgress(null);
    }
  };

  const remove = async (p: Product) => {
    if (uploading) return;
    if (!confirm(`「${p.title}」を削除しますか？`)) return;

    await deleteDoc(doc(colRef, p.id));
    if (p.mediaURL) {
      const ext = p.mediaType === "video" ? "mp4" : "jpg";
      await deleteObject(
        ref(getStorage(), `products/public/${SITE_KEY}/${p.id}.${ext}`)
      ).catch(() => {});
    }
  };

  const openAdd = () => {
    if (uploading) return;
    resetFields();
    setFormMode("add");
  };
  const openEdit = (p: Product) => {
    if (uploading) return;
    setEditing(p);
    setTitle(p.title);
    setBody(p.body);
    setFile(null);
    setFormMode("edit");
  };

  const closeForm = () => {
    if (uploading) return;
    setTimeout(() => {
      resetFields();
      setFormMode(null);
    }, 100); // 少しだけ遅延させるとUIフリーズ対策になる
  };

  const resetFields = () => {
    setEditing(null);
    setTitle("");
    setBody("");

    setFile(null);
    setKeywords(["", "", ""]);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = list.findIndex((item) => item.id === active.id);
    const newIndex = list.findIndex((item) => item.id === over.id);
    const newList = arrayMove(list, oldIndex, newIndex);
    setList(newList);

    const batch = writeBatch(db);
    newList.forEach((item, index) => {
      batch.update(doc(colRef, item.id), { order: index });
    });
    await batch.commit();
  };

  const generateBodyWithAI = async () => {
    const validKeywords = keywords.filter((k) => k.trim() !== "");

    if (!title || validKeywords.length < 1) {
      alert("名前とキーワードを1つ以上入力してください");
      return;
    }

    try {
      setAiLoading(true);
      const res = await fetch("/api/generate-intro-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          keywords: validKeywords,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成に失敗");

      setBody(data.text);
      setKeywords(["", "", ""]); // ←★ 追加（成功時に初期化）
    } catch (err) {
      alert("紹介文の生成に失敗しました");
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (!gradient) return null;

  return (
    <main className="max-w-5xl mx-auto p-4 pt-20">
      {uploading && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 gap-4">
          <p className="text-white">アップロード中… {progress}%</p>
          <div className="w-64 h-2 bg-gray-700 rounded">
            <div
              className="h-full bg-green-500 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={list.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {list.map((p) => {
              return (
                <SortableItem key={p.id} product={p}>
                  {({ listeners, attributes, isDragging }) => (
                    <StaffCard
                      product={p}
                      isAdmin={isAdmin}
                      isDragging={isDragging}
                      isLoaded={loadedIds.has(p.id)}
                      isDark={isDark}
                      gradient={gradient}
                      listeners={listeners}
                      attributes={attributes}
                      onEdit={openEdit}
                      onRemove={remove}
                      onMediaLoad={() =>
                        setLoadedIds((prev) => new Set(prev).add(p.id))
                      }
                      uploading={uploading}
                    />
                  )}
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {isAdmin && formMode === null && (
        <button
          onClick={openAdd}
          aria-label="新規追加"
          disabled={uploading}
          className="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-pink-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          <Plus size={28} />
        </button>
      )}

      {isAdmin && formMode && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-center">
              {formMode === "edit"
                ? "スタッフプロフィールを編集"
                : "スタッフプロフィール追加"}
            </h2>

            <input
              type="text"
              placeholder="名前"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              disabled={uploading}
            />

            <textarea
              placeholder="紹介文"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              rows={4}
              disabled={uploading}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowKeywordInput(!showKeywordInput)}
                className="px-3 py-1 bg-purple-600 text-white rounded flex items-center justify-center gap-1"
              >
                AIで紹介文を作成
              </button>
              {showKeywordInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="キーワード①"
                    className="w-full border px-3 py-2 rounded"
                    value={keywords[0]}
                    onChange={(e) =>
                      setKeywords([e.target.value, keywords[1], keywords[2]])
                    }
                  />
                  <input
                    type="text"
                    placeholder="キーワード②"
                    className="w-full border px-3 py-2 rounded"
                    value={keywords[1]}
                    onChange={(e) =>
                      setKeywords([keywords[0], e.target.value, keywords[2]])
                    }
                  />
                  <input
                    type="text"
                    placeholder="キーワード③"
                    className="w-full border px-3 py-2 rounded"
                    value={keywords[2]}
                    onChange={(e) =>
                      setKeywords([keywords[0], keywords[1], e.target.value])
                    }
                  />
                  <button
                    onClick={generateBodyWithAI}
                    className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <span>生成中...</span>
                      </>
                    ) : (
                      "紹介文を生成する"
                    )}
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="bg-gray-500 text-white w-full h-10 px-3 py-1 rounded"
              disabled={uploading}
            />
            {formMode === "edit" && editing?.originalFileName && (
              <p className="text-sm text-gray-600">
                現在のファイル: {editing.originalFileName}
              </p>
            )}

            <div className="flex gap-2 justify-center">
              <button
                onClick={saveProduct}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
                {formMode === "edit" ? "更新" : "追加"}
              </button>
              <button
                onClick={closeForm}
                disabled={uploading}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface StoreCardProps {
  product: Product;
  isAdmin: boolean;
  isDragging: boolean;
  isLoaded: boolean;
  isDark: boolean;
  gradient: string;
  listeners: any;
  attributes: any;
  onEdit: (p: Product) => void;
  onRemove: (p: Product) => void;
  onMediaLoad: () => void;
  uploading: boolean;
}

export function StaffCard({
  product: p,
  isAdmin,
  isDragging,
  isLoaded,
  isDark,
  gradient,
  listeners,
  attributes,
  onEdit,
  onRemove,
  onMediaLoad,
  uploading,
}: StoreCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -150px 0px" });

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className={clsx(
        "flex flex-col h-full border rounded-lg overflow-hidden shadow relative transition-colors duration-200",
        "bg-gradient-to-b",
        gradient,
        isDragging
          ? "z-50 shadow-xl"
          : isDark
          ? "bg-black/40 text-white"
          : "bg-white",
        "cursor-pointer",
        !isDragging && "hover:shadow-lg"
      )}
    >
      {auth.currentUser !== null && (
        <div
          {...attributes}
          {...listeners}
          onTouchStart={(e) => e.preventDefault()}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center justify-center shadow">
            ≡
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(p);
            }}
            disabled={uploading}
            className="px-2 py-1 bg-blue-600 text-white text-md rounded shadow disabled:opacity-50"
          >
            編集
          </button>
          <button
            onClick={() => onRemove(p)}
            disabled={uploading}
            className="px-2 py-1 bg-red-600 text-white text-md rounded shadow disabled:opacity-50"
          >
            削除
          </button>
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10">
          <svg
            className="w-8 h-8 animate-spin text-pink-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}

      {p.mediaType === "image" ? (
        <div className="relative w-full aspect-[1/1] sm:aspect-square">
          <Image
            src={p.mediaURL}
            alt={p.title}
            fill
            className="object-cover"
            sizes="(min-width:1024px) 320px, (min-width:640px) 45vw, 90vw"
            onLoad={onMediaLoad}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[1/1] sm:aspect-square">
          <video
            src={p.mediaURL}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className="w-full h-full object-cover absolute top-0 left-0"
            onLoadedData={onMediaLoad}
          />
        </div>
      )}

      <div className="p-3 space-y-2">
        <h2 className={clsx("text-sm font-bold", isDark && "text-white")}>
          {p.title}
        </h2>
        <p
          className={clsx(
            "text-sm whitespace-pre-wrap",
            isDark && "text-white"
          )}
        >
          {p.body}
        </p>
      </div>
    </motion.div>
  );
}
