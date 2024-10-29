import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import LessonTimeline from './LessonTimeline';
import StudentInfo from './StudentInfo';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nativeLanguage: string;
  language: string;
  level: string;
  createdAt: string;
  completedLessons: number;
  startDate: string;
}

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

const StudentProfile = ({ studentId, onBack }: StudentProfileProps) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = await user?.getIdToken();
        const response = await fetch(`/api/students/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student');
        }

        const data = await response.json();
        setStudent({
          ...data.student,
          completedLessons: data.student.completedLessons || 0,
          startDate: data.student.startDate || data.student.createdAt,
          nativeLanguage: data.student.nativeLanguage || 'Not specified',
        });
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && studentId) {
      fetchStudent();
    }
  }, [studentId, user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  const getLevelColor = (level: string) => {
    if (level.startsWith('A')) return 'bg-green-50 text-green-600';
    if (level.startsWith('B')) return 'bg-blue-50 text-[#396afc]';
    if (level.startsWith('C')) return 'bg-red-50 text-red-600';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="p-8">
      {/* Header with back button */}
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-gray-600 hover:bg-gray-100 mb-6 flex items-center"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Students
      </Button>

      {/* Student Overview */}
      <StudentInfo student={student} />

      {/* Progress Overview */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <GraduationCap className="w-6 h-6 text-[#396afc]" />
          <h2 className="text-xl font-semibold text-gray-900">Learning Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-[#396afc] mb-1">Completed Lessons</div>
            <div className="text-2xl font-bold text-gray-900">{student.completedLessons}</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-[#396afc] mb-1">Current Level</div>
            <div className={`inline-block px-3 py-1 rounded-lg ${getLevelColor(student.level)} text-2xl font-bold`}>
              {student.level}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-[#396afc] mb-1">Learning Since</div>
            <div className="text-2xl font-bold text-gray-900">
              {student.startDate 
                ? new Date(student.startDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : 'Not available'}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Timeline */}
      <LessonTimeline studentId={student.id} />
    </div>
  );
};

export default StudentProfile;
