"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";

import { formSchema } from "./constants";

/**
 * 音楽生成ページのコンポーネント。
 * ユーザーがプロンプトを元に、生成された音楽を取得します。
 * @returns {JSX.Element} 音楽生成ページのコンポーネント
 */
const MusicPage = () => {
  const router = useRouter();
  const [music, setMusic] = useState<string>();

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
   * 生成された音楽の状態をクリアする。
   */
  const clearMusic = () => {
    setMusic(undefined);
  };

  /**
   * APIにリクエストを送信し、生成された音楽のURLを取得する。
   * @param {z.infer<typeof formSchema>} prompt - ユーザーが入力したプロンプト
   * @returns {Promise<string>} 生成された音楽のURL
   */
  const fetchMusicFromAPI = async (
    prompt: z.infer<typeof formSchema>,
  ): Promise<string> => {
    const response = await axios.post("/api/music", prompt);
    return response.data.audio;
  };

  /**
   * ページをリフレッシュする。
   */
  const refreshPage = () => {
    router.refresh();
  };

  /**
   * フォームの送信時の処理。
   * ユーザーの入力を元に、生成された音楽を取得し、状態に反映する。
   * @param {z.infer<typeof formSchema>} prompt - ユーザーが入力したプロンプト
   */
  const onSubmit = async (
    prompt: z.infer<typeof formSchema>,
  ): Promise<void> => {
    try {
      clearMusic();
      const musicURL = await fetchMusicFromAPI(prompt);
      setMusic(musicURL);
      form.reset();
    } catch (error: unknown) {
      console.error(error);
    } finally {
      refreshPage();
    }
  };

  return (
    <div>
      <Heading
        title="Music Generation"
        description="Turn your prompt into music."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
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
                      placeholder="Piano solo"
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
        {!music && !isLoading && <Empty label="No music generated." />}
        {music && (
          <audio controls className="mt-8 w-full">
            <source src={music} />
          </audio>
        )}
      </div>
    </div>
  );
};

export default MusicPage;
