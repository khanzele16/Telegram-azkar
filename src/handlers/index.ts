import dayjs from "dayjs";
import { IPrayTime, MyContext } from "../types";
import { StreakService } from "../services/StreakService";
import User from "../database/models/User";
import { CalendarService } from "../services/CalendarService";
import { generateCalendarMarkup } from "../shared/calendarMarkup";
import { getPrayTime } from "../shared/requests";
import { register } from "../database/controllers/auth";

export async function profileHandler(ctx: MyContext) {
  const user = await User.findOne({ telegramId: ctx.from?.id });
  if (!user) return ctx.reply("Вы не зарегистрированы");
  const isRegistered: boolean = await register(ctx);
  if (!isRegistered || !user.location?.latitude || !user.location?.longitude) {
    await ctx.conversation.enter("startConversation");
    return;
  }
  const stats = await StreakService.getProfileStats(user._id);
  const prayTime: IPrayTime | null = await getPrayTime(
    user.location?.latitude.toString(),
    user.location?.longitude.toString()
  );

  await ctx.reply(
    `<b>👤 Профиль — ${user.username || "Ваш"}</b>\n\n` +
      `🌅 Утренний намаз (UTC): ${prayTime?.timings.Fajr || "-"}\n` +
      `🌃 Вечерний намаз (UTC): ${prayTime?.timings.Maghrib || "-"}\n\n` +
      `🔥 Текущий стрик: ${stats.currentStreak} дней\n` +
      `📈 Прочитано дней: ${stats.totalReadDays}\n` +
      `❌ Пропущено дней: ${stats.totalSkippedDays}`,
    { parse_mode: "HTML" }
  );
}

export const calendarHandler = async (ctx: MyContext) => {
  try {
    if (!ctx.from?.id || !ctx.callbackQuery?.message) return;

    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user)
      return ctx.answerCallbackQuery({ text: "Вы не зарегистрированы" });

    const data = ctx.callbackQuery.data;
    let year = dayjs().year();
    let month = dayjs().month() + 1;

    if (data && data.startsWith("calendar:")) {
      const parts = data.split(":");
      if (parts.length === 3) {
        year = Number(parts[1]);
        month = Number(parts[2]);
      }
    }

    const calendar = await CalendarService.getMonthCalendar(
      user._id,
      year,
      month
    );
    const keyboard = generateCalendarMarkup(calendar, year, month);

    await ctx.editMessageReplyMarkup({ reply_markup: keyboard });

    await ctx.answerCallbackQuery();
  } catch (err) {
    console.error("calendarHandler error:", err);
    await ctx.answerCallbackQuery({ text: "Ошибка при обновлении календаря" });
  }
};
