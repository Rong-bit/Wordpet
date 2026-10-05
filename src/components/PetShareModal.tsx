import React, { useRef, useState } from 'react';
import { Pet, UserProfile } from '../types';
import { PetCanvas } from './PetCanvas';
import { X, Share2, Copy, Check, Download, Twitter, Facebook, ExternalLink } from 'lucide-react';

interface PetShareModalProps {
  pet: Pet;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PetShareModal: React.FC<PetShareModalProps> = ({
  pet,
  profile,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareText = `🔥 我在 WordPet 艾賓豪斯單字冒險中培育出了 Lv.${pet.level}【${pet.name}】(${pet.rarity.toUpperCase()})！\n已連續複習 ${profile.streakDays} 天，累積掌握單字量激增！快來跟我一起培育神獸背單字吧！ #WordPet #英文單字 #艾賓豪斯記憶法`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `WordPet - 我的專屬神獸 ${pet.name}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyText();
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold font-fun text-white">社群成就榮耀分享</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Card to be captured or viewed */}
        <div
          ref={cardRef}
          className="my-4 relative overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 p-5 shadow-2xl text-center"
        >
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30 mb-2">
            <span>✨ WordPet 艾賓豪斯記憶殿堂</span>
          </div>

          <div className="my-2 flex justify-center">
            <PetCanvas pet={pet} size="md" interactive={false} />
          </div>

          <h4 className="text-2xl font-bold font-fun text-white">{pet.name}</h4>
          <p className="text-xs text-amber-400 font-semibold">{pet.title}・Lv.{pet.level}</p>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-2.5 border border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400">連續複習</p>
              <p className="text-sm font-bold text-orange-400">{profile.streakDays} 天 🔥</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">品質評價</p>
              <p className="text-sm font-bold text-purple-400">{pet.rarity.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">總經驗值</p>
              <p className="text-sm font-bold text-emerald-400">{pet.exp} EXP</p>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 italic">
            「{pet.specialTrait}」
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 p-2.5 text-xs font-bold text-sky-300 transition-colors"
            >
              <Twitter className="h-4 w-4" /> 分享到 X / Twitter
            </button>
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 p-2.5 text-xs font-bold text-blue-300 transition-colors"
            >
              <Facebook className="h-4 w-4" /> 分享到 Facebook
            </button>
          </div>

          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 p-3 text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-600/30"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                已複製分享卡成果文案到剪貼簿！
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                一鍵複製成果與神獸狀態
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
