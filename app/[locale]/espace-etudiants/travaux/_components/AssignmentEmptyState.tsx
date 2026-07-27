import { FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

interface AssignmentEmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AssignmentEmptyState({ title, description, action }: AssignmentEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm mb-4">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
