import React from 'react';
import { BookOpen, Users, Clock, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CourseCardProps {
    course: any;
    showTeacher?: boolean;
    onClick?: () => void;
    action?: React.ReactNode;
    badges?: React.ReactNode;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, showTeacher, onClick, action, badges }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/learn/courses/${course.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col cursor-pointer h-full"
        >
            <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative overflow-hidden flex-shrink-0">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-8 h-8 opacity-50 text-slate-300 dark:text-slate-600" />
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {course.price > 0 ? `${new Intl.NumberFormat('vi-VN').format(course.price)}đ` : 'Miễn phí'}
                    </div>
                    {badges}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>
                {course.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2 flex-grow">
                        {course.description}
                    </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 mt-auto pt-2">
                    <span className="flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5" /> {course.max_students} hv</span>
                    <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> {course.duration_weeks} tuần</span>
                </div>

                {(showTeacher || action) && (
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                        {showTeacher ? (
                            <div className="flex items-center gap-2">
                                {course.teacher?.avatar_url ? (
                                    <img src={course.teacher.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-600">
                                        {course.teacher?.full_name?.[0] || 'G'}
                                    </div>
                                )}
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{course.teacher?.full_name || 'GV Khuyết Danh'}</span>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};
