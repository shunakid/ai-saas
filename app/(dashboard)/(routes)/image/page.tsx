"use client";

import * as z from "zod";
import axios, { AxiosResponse } from "axios";
import Image from "next/image";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Empty } from "@/components/empty";

import { amountOptions, formSchema, resolutionOptions } from "./constants";

/**
 * 画像生成ページのメインコンポーネント。
 * ユーザーがプロンプトを入力し、その応答として画像を生成します。
 * @returns {JSX.Element} 画像生成ページのコンポーネント
 */
const PhotoPage = () => {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);

  /**
   * フォームの設定とバリデーション。
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
    },
  });

  const isLoading = form.formState.isSubmitting;

  /**
   * 生成された画像の状態をクリアする。
   */
  const clearPhotos = () => {
    setPhotos([]);
  };

  /**
   * APIにリクエストを送信し、生成された画像のURLを取得する。
   * @param {z.infer<typeof formSchema>} values - ユーザーからの入力。
   * @returns {Promise} APIからのレスポンス。
   */
  const sendRequestToAPI = async (values: z.infer<typeof formSchema>) => {
    return await axios.post("/api/image", values);
  };

  /**
   * 生成された画像の状態を更新する。
   * @param {Array<{ url: string }>} responseData - APIからのレスポンスデータ。
   */
  const updatePhotosState = (responseData: { url: string }[]) => {
    const urls = responseData.map((image: { url: string }) => image.url);
    setPhotos(urls);
  };

  /**
   * ページをリフレッシュする。
   */
  const refreshPage = () => {
    router.refresh();
  };

  /**
   * フォームの送信時の処理。
   * ユーザーの入力を元に、生成された画像を取得し、状態に反映する。
   * @param {z.infer<typeof formSchema>} values - ユーザーからの入力。
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      clearPhotos();
      const response = await sendRequestToAPI(values);
      updatePhotosState(response.data);
    } catch (error: any) {
      // エラーハンドリング
    } finally {
      refreshPage();
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
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
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="A picture of a horse in Swiss alps"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resolutionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        {photos.length === 0 && !isLoading && (
          <Empty label="No images generated." />
        )}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((src) => (
            <Card key={src} className="overflow-hidden rounded-lg">
              <div className="relative aspect-square">
                <Image fill alt="Generated" src={src} />
              </div>
              <CardFooter className="p-2">
                <Button
                  onClick={() => window.open(src)}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoPage;
