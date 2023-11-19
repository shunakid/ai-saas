"use client";

import * as z from "zod";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatCompletionRequestMessage } from "openai";
import { zodResolver } from "@hookform/resolvers/zod";

import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/empty";
import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";

/**
 * 会話ページのメインコンポーネント。
 * ユーザーがプロンプトを入力し、その応答として会話を生成します。
 * @returns {JSX.Element} 会話ページのコンポーネント
 */
const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

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
   * ユーザーからの入力をメッセージ形式に変換する。
   * @param {z.infer<typeof formSchema>} values - ユーザーからの入力。
   * @returns {ChatCompletionRequestMessage} メッセージ形式に変換された入力。
   */
  const prepareUserMessage = (
    values: z.infer<typeof formSchema>,
  ): ChatCompletionRequestMessage => {
    return {
      role: "user",
      content: values.prompt,
    };
  };

  /**
   * APIにリクエストを送信し、応答として会話を取得する。
   * @param {ChatCompletionRequestMessage} userMessage - ユーザーからのメッセージ。
   * @returns {Promise} APIからのレスポンス。
   */
  const sendRequestToAPI = async (
    userMessage: ChatCompletionRequestMessage,
  ) => {
    const newMessages = [...messages, userMessage];
    return await axios.post("/api/conversation", { messages: newMessages });
  };

  /**
   * 会話の状態を更新する。
   * @param {ChatCompletionRequestMessage} userMessage - ユーザーからのメッセージ。
   * @param {any} responseData - APIからのレスポンスデータ。
   */
  const updateMessagesState = (
    userMessage: ChatCompletionRequestMessage,
    responseData: any,
  ) => {
    setMessages((current) => [...current, userMessage, responseData]);
  };

  /**
   * ページをリフレッシュする。
   */
  const refreshPage = () => {
    router.refresh();
  };

  /**
   * フォームの送信時の処理。
   * ユーザーの入力を元に、生成された会話を取得し、状態に反映する。
   * @param {z.infer<typeof formSchema>} values - ユーザーからの入力。
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userMessage = prepareUserMessage(values);
    try {
      const response = await sendRequestToAPI(userMessage);
      updateMessagesState(userMessage, response.data);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      }
    } finally {
      refreshPage();
    }
  };

  return (
    <div>
      <Heading
        title="会話"
        description="AIに質問してみましょう。"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
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
                        placeholder="ChatGPTとは何ですか？"
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
                生成
              </Button>
            </form>
          </Form>
        </div>
        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="flex w-full items-center justify-center rounded-lg bg-muted p-8">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="ここに表示されます" />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message) => (
              <div
                key={message.content}
                className={cn(
                  "flex w-full items-start gap-x-8 rounded-lg p-8",
                  message.role === "user"
                    ? "border border-black/10 bg-white"
                    : "bg-muted",
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
