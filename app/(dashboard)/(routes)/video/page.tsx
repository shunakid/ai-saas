"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileAudio } from "lucide-react";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";

import { formSchema } from "./constants";

/**
 * ビデオ生成ページのコンポーネント。
 * ユーザーのプロンプトを元に、生成した動画を取得します。
 * @returns {JSX.Element} ビデオ生成ページのコンポーネント
 */
const VideoPage = () => {
  const router = useRouter();
  const [video, setVideo] = useState<string>();

  /**
   * フォームの設定とバリデーション。
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  /**
   * 生成されたビデオの状態をクリアする。
   */
  const clearVideo = () => {
    setVideo(undefined);
  };

  /**
   * APIにリクエストを送信し、生成されたビデオのURLを取得する。
   * @param {z.infer<typeof formSchema>} prompt - ユーザーが入力したプロンプト
   * @returns {Promise<string>} 生成されたビデオのURL
   */
  const fetchVideoFromAPI = async (
    prompt: z.infer<typeof formSchema>,
  ): Promise<string> => {
    const response = await axios.post<string>("/api/video", prompt);
    return response.data;
  };

  /**
   * ページをリフレッシュする。
   */
  const refreshPage = () => {
    router.refresh();
  };

  /**
   * フォームの送信時の処理。
   * ユーザーの入力を元に、生成されたビデオを取得し、状態に反映する。
   * @param {z.infer<typeof formSchema>} prompt - ユーザーが入力したプロンプト
   */
  const onSubmit = async (
    prompt: z.infer<typeof formSchema>,
  ): Promise<void> => {
    try {
      clearVideo();
      const videoURL = await fetchVideoFromAPI(prompt);
      setVideo(videoURL);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      refreshPage();
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={FileAudio}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
              grid
              w-full
              grid-cols-12
              gap-2
              rounded-lg
              border
              p-4
              px-3
              focus-within:shadow-sm
              md:px-6
            "
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Clown fish swimming in a coral reef"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 w-full lg:col-span-2"
              type="submit"
              disabled={isLoading}
              size="icon"
            >
              Generate
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {!video && !isLoading && <Empty label="No video files generated." />}
        {video && (
          <video
            controls
            className="mt-8 aspect-video w-full rounded-lg border bg-black"
          >
            <source src={video} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
