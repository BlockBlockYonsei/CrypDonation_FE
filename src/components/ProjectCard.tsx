import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Project } from '../data/mockData.ts';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const fundingPercentage = Math.min((project.raisedAmount / project.goalAmount) * 100, 100);

  // NOTE:
  // - Backend may return `coverUrl` (e.g. for newly created projects)
  // - The UI previously expected `thumbnailUrl`
  // - Also, `blob:` URLs are *session-scoped* (created by URL.createObjectURL) and will break after refresh.
  const FALLBACK_THUMBNAIL = useMemo(
    () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
          <rect width="800" height="600" fill="#f3f4f6"/>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="24">
            No thumbnail
          </text>
        </svg>`
      )}`,
    []
  );

  // Prefer a dedicated thumbnail field for cards.
  // `coverUrl` is treated as a cover/background image (used in detail page) and is only a fallback here.
  const initialThumbnail =
    (project as any).thumbnailUrl ||
    (project as any).thumbnail ||
    (project as any).thumbnailURL ||
    (project as any).coverUrl ||
    '';

  const [imgSrc, setImgSrc] = useState<string>(initialThumbnail || FALLBACK_THUMBNAIL);

  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={imgSrc}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={() => setImgSrc(FALLBACK_THUMBNAIL)}
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
            <p className="text-white text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            <span className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium">
              View Details
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              project.status === 'live' ? 'bg-green-500 text-white' :
              project.status === 'successful' ? 'bg-blue-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <div className="text-xs text-gray-500 mb-2">
            {project.category}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
            {project.title}
          </h3>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all"
                style={{ width: `${fundingPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="font-semibold text-gray-900">
                ${project.raisedAmount.toLocaleString()}
              </div>
              <div className="text-gray-500 text-xs">
                of ${project.goalAmount.toLocaleString()} goal
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{project.daysLeft} days</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
