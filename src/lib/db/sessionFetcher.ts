import { supabase } from '@/lib/supabaseClient';

export interface InterviewSession {
  id: string;
  user_id: string;
  topic: string;

  session_data: {
    question: string;
    answer: string;
    userAnswer?: string;
    feedback?: string;
  }[];

  created_at: string;
}

export async function getPastSessions(
  userId: string
): Promise<InterviewSession[]> {

  try {

    const { data, error } = await supabase
      .from<InterviewSession>(
        'interview_sessions'
      )
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .execute();

    if (error) {
      console.error('Supabase Fetch Error:', error);
      return [];
    }

    return data || [];

  } catch (error) {

    console.error('Failed to fetch sessions:', error);

    return [];
  }
}
