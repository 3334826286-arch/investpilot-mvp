import { ContentPage } from "@/components/content-page";

export const metadata = {
  title: "隐私政策"
};

export default function PrivacyPage() {
  return (
    <ContentPage
      kicker="隐私政策"
      title="我们如何处理游客与后续用户的数据"
      description="正式上线前，平台会尽量采用最少必要原则处理数据。对于游客模式，优先使用浏览器本地存储，而不是要求先注册登录。"
      aside={
        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <p className="section-kicker">当前默认策略</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">游客自选股、最近浏览和搜索历史默认存储在本地浏览器。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">核心浏览功能不要求先提交姓名、手机号或身份证明信息。</div>
            <div className="rounded-[20px] border border-slate-900/8 bg-white/84 px-4 py-4">未来如开放可选登录，会在登录流程中单独说明收集范围与用途。</div>
          </div>
        </section>
      }
    >
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">1. 收集范围</p>
        <p className="mt-3">
          对于游客模式，我们当前主要处理你主动输入的搜索词、上传的文档内容，以及保存在本地浏览器中的自选股、最近浏览和搜索历史。平台不会因为访问首页而要求你先提供个人身份信息。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">2. 使用目的</p>
        <p className="mt-3">
          数据仅用于向你返回市场研究、个股分析、文档提炼结果，以及改善产品可用性和稳定性。我们不会将这些信息表述为投资建议，也不会基于这些数据向你承诺收益。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">3. 本地存储</p>
        <p className="mt-3">
          游客状态下的自选股、最近浏览和搜索历史优先保存在你的浏览器中。你可以通过清理浏览器本地数据来删除这些记录。若未来开放账户同步，我们会另行提供同步说明和关闭选项。
        </p>
      </div>
      <div className="rounded-[24px] border border-slate-900/8 bg-white/84 p-5">
        <p className="font-medium text-slate-950">4. 更新与联系</p>
        <p className="mt-3">
          随着产品从公测走向正式版，这份隐私政策可能更新。若你对数据处理方式有疑问，可通过联系我们页面反馈。
        </p>
      </div>
    </ContentPage>
  );
}
