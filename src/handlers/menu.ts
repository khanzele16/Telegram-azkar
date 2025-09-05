import { Menu } from "@grammyjs/menu";
import { MyContext } from "../types";
import { profileHandler } from "./profileHandler";

export const menuButtons = new Menu<MyContext>("menu")
  .text("👤 Мой профиль", async (ctx) => {
    await ctx.answerCallbackQuery("👤 Мой профиль");
    ctx.menu.close();
    await profileHandler(ctx);
  })
  .row()
  .text("📍 Геолокация", async (ctx) => {
    await ctx.answerCallbackQuery("📍 Геолокация");
    ctx.menu.close();
    await ctx.conversation.enter("locationConversation");
  })
  .text("🗓 Статистика", async (ctx) => {
    await ctx.answerCallbackQuery("🗓 Статистика");
    ctx.menu.close();
    
  })
  .row()
  .text("❓ Помощь", async (ctx) => {
    await ctx.answerCallbackQuery("❓ Помощь");
    ctx.menu.close();
    await ctx.reply(
      "<b>Помощь</b>\n\nЕсли возникли какие-то трудности, то пишите @khanzele",
      { parse_mode: "HTML" }
    );
  });
