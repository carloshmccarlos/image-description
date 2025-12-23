'use client'

import { Trash2 } from 'lucide-react'
import { deleteLesson } from '@/actions/save-lesson'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        e.stopPropagation() // Prevent event bubbling to the card Link

        if (!confirm('Are you sure you want to delete this lesson?')) return

        setIsDeleting(true)
        try {
            await deleteLesson(lessonId)
            router.refresh()
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete lesson.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Delete Lesson"
        >
            {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    )
}
