"use client";

import { useState, useEffect } from "react";
import { Review, getReviews, postReview } from "@/app/lib/api";

export default function ReviewSection({ phoneId }: { phoneId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [phoneId]);

  const fetchReviews = async () => {
    try {
      const data = await getReviews(phoneId);
      setReviews(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim() || rating === 0) {
      alert("Please provide a name, rating, and comment.");
      return;
    }
    
    setSubmitting(true);
    try {
      const newReview = await postReview({
        phoneId,
        userName,
        rating,
        comment
      });
      setReviews([newReview, ...reviews]);
      setUserName("");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm mt-[15px]">
      <div className="p-6 border-b border-border-subtle bg-surface-container-low/30">
        <h2 className="font-headline-md text-xl font-bold text-text-main flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-500">star</span>
          User Reviews
        </h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Write a Review Form */}
        <div className="md:col-span-1 bg-surface-container-lowest p-5 rounded-lg border border-border-subtle h-fit">
          <h3 className="font-bold text-lg text-text-main mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-2 border border-border-subtle rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className="text-yellow-500 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <span 
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: star <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-main mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What do you think about this phone?"
                rows={4}
                className="w-full p-2 border border-border-subtle rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-primary hover:bg-on-primary-fixed-variant text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
              <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="border border-border-subtle rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full uppercase">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main leading-tight">{review.userName}</h4>
                        <span className="text-xs text-text-muted">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-text-main text-sm mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
