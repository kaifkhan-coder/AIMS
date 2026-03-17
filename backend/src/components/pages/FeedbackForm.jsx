import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const feedbackSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  resolvedCompletely: z.string().min(1, "Please select an option"),
  responseSpeed: z.string().min(1, "Please select response speed"),
  staffBehavior: z.string().min(1, "Please select staff behavior"),
  recommendSupport: z.string().min(1, "Please select an option"),
  comment: z.string().optional(),
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function FeedbackForm({ incidentId, onSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 5,
      resolvedCompletely: "",
      responseSpeed: "",
      staffBehavior: "",
      recommendSupport: "",
      comment: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await axios.post(
        "${process.env.BACKEND_URL}/api/incidents/feedback",
        {
          incidentId,
          rating: data.rating,
          resolvedCompletely: data.resolvedCompletely,
          responseSpeed: data.responseSpeed,
          staffBehavior: data.staffBehavior,
          recommendSupport: data.recommendSupport,
          comment: data.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("FEEDBACK ERROR:", err);
      setSubmitError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-400" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white">Thank you!</h3>
        <p className="text-slate-300">
          Your feedback has been successfully submitted.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-md mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h3 className="text-xl font-semibold text-white tracking-tight">
          Rate the resolution
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Let us know how we did resolving this incident.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div variants={itemVariants} className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Overall Rating
          </label>

          <Controller
            name="rating"
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ${
                        (hoveredStar !== null ? star <= hoveredStar : star <= value)
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "fill-transparent text-slate-600 hover:text-slate-500"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          />

          {errors.rating && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.rating.message}
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Was your issue resolved completely?
          </label>
          <select
            {...register("resolvedCompletely")}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="Partially">Partially</option>
            <option value="No">No</option>
          </select>
          {errors.resolvedCompletely && (
            <p className="text-red-400 text-sm">{errors.resolvedCompletely.message}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            How was the response speed?
          </label>
          <select
            {...register("responseSpeed")}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select</option>
            <option value="Very Fast">Very Fast</option>
            <option value="Fast">Fast</option>
            <option value="Average">Average</option>
            <option value="Slow">Slow</option>
            <option value="Very Slow">Very Slow</option>
          </select>
          {errors.responseSpeed && (
            <p className="text-red-400 text-sm">{errors.responseSpeed.message}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            How was staff behavior?
          </label>
          <select
            {...register("staffBehavior")}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Poor">Poor</option>
          </select>
          {errors.staffBehavior && (
            <p className="text-red-400 text-sm">{errors.staffBehavior.message}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Would you recommend this support service?
          </label>
          <select
            {...register("recommendSupport")}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
          </select>
          {errors.recommendSupport && (
            <p className="text-red-400 text-sm">{errors.recommendSupport.message}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-slate-300"
          >
            Additional Comments <span className="text-slate-500">(Optional)</span>
          </label>

          <textarea
            id="comment"
            {...register("comment")}
            placeholder="Tell us more about your experience..."
            rows={4}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
          />
        </motion.div>

        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}