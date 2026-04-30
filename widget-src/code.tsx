const { widget } = figma;
const {
  AutoLayout,
  Text,
  Input,
  SVG,
  useSyncedState,
  usePropertyMenu,
} = widget;

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F9FAFB",
  surface: "#1B7F5B",
  userBubble: "#F4A261",
  botBubble: "#c4c4c4",
  inputBg: "#F4A261",
  border: "#000000",
  textPrimary: "#ffffff",
  textSecondary: "#DFF5ES",
  accent: "#1B7F5B",
  error: "#DFF5EC",
  sending: "#000000",
};

const WIDGET_WIDTH = 420;


// ── Main Widget ────────────────────────────────────────────────────────────
function AIChatbotWidget() {
  const [messages, setMessages] = useSyncedState<Message[]>("messages", []);
  const [inputText, setInputText] = useSyncedState("inputText", "");
  const [isLoading, setIsLoading] = useSyncedState("isLoading", false);
  const [apiKey, setApiKey] = useSyncedState("apiKey", "");
  const [systemPrompt, setSystemPrompt] = useSyncedState(
    "systemPrompt",
    "You are a helpful career assistant for hispanic young adults and adults. You  are to help with any of the career questions like explaining job pay, or career path changes to the user using professional opinions."
  );
  const [showSettings, setShowSettings] = useSyncedState("showSettings", false);
  const [errorMsg, setErrorMsg] = useSyncedState("errorMsg", "");

  // Property menu (top-right widget menu)
  usePropertyMenu(
    [
      { itemType: "action", propertyName: "toggleSettings", tooltip: "Settings" },
      { itemType: "separator" },
      { itemType: "action", propertyName: "clearChat", tooltip: "Clear Chat" },
    ],
    ({ propertyName }) => {
      if (propertyName === "toggleSettings") setShowSettings(!showSettings);
      if (propertyName === "clearChat") {
        setMessages([]);
        setErrorMsg("");
      }
    }
  );

  // ── Send Message ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    if (!apiKey) {
      setErrorMsg("⚠️ Add your OpenAI API key in Settings first.");
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {  // ← changed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,  
        },
        body: JSON.stringify({
          model: "gpt-4o",  
          max_tokens: 1024,
          messages: [
            { role: "system", content: systemPrompt }, 
            ...updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content ?? "(No response)";  // ← changed

      setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setErrorMsg(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AutoLayout
      direction="vertical"
      width={WIDGET_WIDTH}
      fill={COLORS.bg}
      cornerRadius={16}
      stroke={COLORS.border}
      strokeWidth={1}
      spacing={0}
      overflow="hidden"
    >
      {/* Header */}
      <AutoLayout
        direction="horizontal"
        width="fill-parent"
        padding={{ horizontal: 20, vertical: 14 }}
        fill={COLORS.surface}
        spacing={10}
        verticalAlignItems="center"
      >
        <AutoLayout
          width={10}
          height={10}
          cornerRadius={5}
          fill={isLoading ? COLORS.sending : COLORS.accent}
        />
        <Text fontSize={15} fontWeight={700} fill={COLORS.textPrimary}>
          AI Career Assistant
        </Text>
        <AutoLayout width="fill-parent" />
        <Text
          fontSize={11}
          fill={COLORS.textSecondary}
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? "← Back" : "⚙ Settings"}
        </Text>
      </AutoLayout>

      {/* Settings Panel */}
      {showSettings && (
        <AutoLayout
          direction="vertical"
          width="fill-parent"
          padding={20}
          fill={COLORS.inputBg}
          spacing={14}
        >
          <Text fontSize={13} fontWeight={600} fill={COLORS.textPrimary}>
            API Key
          </Text>
          <Input
            value={apiKey}
            placeholder="sk-ant-..."
            onTextEditEnd={(e) => setApiKey(e.characters)}
            fontSize={12}
            fill={COLORS.textSecondary}
            width="fill-parent"
            inputBehavior="password"
          />
          <Text fontSize={13} fontWeight={600} fill={COLORS.textPrimary}>
            System Prompt
          </Text>
          <Input
            value={systemPrompt}
            placeholder="You are a helpful assistant..."
            onTextEditEnd={(e) => setSystemPrompt(e.characters)}
            fontSize={12}
            fill={COLORS.textSecondary}
            width="fill-parent"
            inputBehavior="multiline"
          />
          <Text fontSize={11} fill={COLORS.textSecondary}>
            Your API key is stored in this widget only.
          </Text>
        </AutoLayout>
      )}

      {/* Messages */}
      {!showSettings && (
        <AutoLayout
          direction="vertical"
          width="fill-parent"
          padding={16}
          spacing={12}
          minHeight={300}
        >
          {messages.length === 0 && (
            <AutoLayout
              direction="vertical"
              width="fill-parent"
              height="fill-parent"
              horizontalAlignItems="center"
              padding={{ vertical: 40 }}
              spacing={8}
            >
              <Text fontSize={28}>💡</Text>
              <Text fontSize={13} fill={COLORS.surface} textAlignHorizontal="center">
                Ask me anything career related!
              </Text>
            </AutoLayout>
          )}

          {messages.map((msg, i) => (
            <AutoLayout
              key={`msg-${i}`}
              direction="vertical"
              width="fill-parent"
              horizontalAlignItems={msg.role === "user" ? "end" : "start"}
              spacing={4}
            >
              <Text fontSize={10} fill={COLORS.textSecondary}>
                {msg.role === "user" ? "You" : "Assistant"}
              </Text>
              <AutoLayout
                padding={{ horizontal: 14, vertical: 10 }}
                fill={msg.role === "user" ? COLORS.userBubble : COLORS.botBubble}
                cornerRadius={msg.role === "user" ? { topLeft: 12, topRight: 4, bottomLeft: 12, bottomRight: 12 } : { topLeft: 4, topRight: 12, bottomLeft: 12, bottomRight: 12 }}
                maxWidth={300}
              >
                <Text
                  fontSize={13}
                  fill={COLORS.textPrimary}
                  lineHeight={20}
                >
                  {msg.content}
                </Text>
              </AutoLayout>
            </AutoLayout>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <AutoLayout
              padding={{ horizontal: 14, vertical: 10 }}
              fill={COLORS.botBubble}
              cornerRadius={{ topLeft: 4, topRight: 12, bottomLeft: 12, bottomRight: 12 }}
            >
              <Text fontSize={13} fill={COLORS.textSecondary}>
                Thinking...
              </Text>
            </AutoLayout>
          )}

          {/* Error */}
          {errorMsg !== "" && (
            <AutoLayout
              padding={{ horizontal: 14, vertical: 10 }}
              fill="#2D1515"
              cornerRadius={8}
              stroke={COLORS.error}
              strokeWidth={1}
              width="fill-parent"
            >
              <Text fontSize={12} fill={COLORS.error}>
                {errorMsg}
              </Text>
            </AutoLayout>
          )}
        </AutoLayout>
      )}

      {/* Input Area */}
      {!showSettings && (
        <AutoLayout
          direction="horizontal"
          width="fill-parent"
          padding={14}
          fill={COLORS.inputBg}
          spacing={10}
          verticalAlignItems="center"
          stroke={COLORS.border}
          strokeWidth={1}
          strokeAlign="inside"
        >
          <AutoLayout
            fill={COLORS.bg}
            cornerRadius={10}
            padding={{ horizontal: 14, vertical: 10 }}
            width="fill-parent"
            stroke={COLORS.border}
            strokeWidth={1}
          >
            <Input
              value={inputText}
              placeholder={isLoading ? "Waiting for response..." : "Ask something..."}
              onTextEditEnd={(e) => setInputText(e.characters)}
              fontSize={13}
              fill={COLORS.border}
              width="fill-parent"
              inputBehavior="multiline"
            />
          </AutoLayout>

          {/* Send Button */}
          <AutoLayout
            padding={{ horizontal: 16, vertical: 10 }}
            fill={isLoading ? COLORS.border : COLORS.accent}
            cornerRadius={10}
            onClick={isLoading ? undefined : sendMessage}
          >
            <Text fontSize={13} fontWeight={600} fill={COLORS.textPrimary}>
              {isLoading ? "..." : "Send"}
            </Text>
          </AutoLayout>
        </AutoLayout>
      )}
    </AutoLayout>
  );
}

widget.register(AIChatbotWidget); 