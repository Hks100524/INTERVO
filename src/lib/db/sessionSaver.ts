import { supabase } from '@/lib/supabaseClient';

export interface SessionData {
  question: string;
  answer: string;
  userAnswer?: string;
  feedback?: string;
}

export async function saveSession(
  topic: string,
  sessionData: SessionData[],
  userId: string
) {
  try {
    console.log('========== SAVE SESSION START ==========');
    console.log('TOPIC:', topic);
    console.log('USER ID:', userId);
    console.log('SESSION DATA LENGTH:', sessionData.length);

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([
        {
          topic,
          session_data: sessionData,
          user_id: userId,
        },
      ])
      .select()
      .execute();

    console.log('INSERT DATA:', data);
    console.log('INSERT ERROR:', error);

    if (error) {
      console.error('Supabase Save Error:', error);

      return {
        success: false,
        data: null,
        error,
      };
    }

    console.log('SESSION SAVED SUCCESSFULLY');

    return {
      success: true,
      data,
      error: null,
    };

  } catch (error) {
    console.error('Failed to save session:', error);

    return {
      success: false,
      data: null,
      error,
    };
  }
}
