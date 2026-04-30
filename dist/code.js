"use strict";
var widget = (() => {
  // widget-src/code.tsx
  var { widget } = figma;
  var {
    AutoLayout,
    Text,
    Input,
    SVG,
    useSyncedState,
    usePropertyMenu
  } = widget;
  var COLORS = {
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
    sending: "#000000"
  };
  var WIDGET_WIDTH = 420;
  function AIChatbotWidget() {
    const [messages, setMessages] = useSyncedState("messages", []);
    const [inputText, setInputText] = useSyncedState("inputText", "");
    const [isLoading, setIsLoading] = useSyncedState("isLoading", false);
    const [apiKey, setApiKey] = useSyncedState("apiKey", "");
    const [systemPrompt, setSystemPrompt] = useSyncedState(
      "systemPrompt",
      "You are a helpful career assistant for hispanic young adults and adults. You  are to help with any of the career questions like explaining job pay, or career path changes to the user using professional opinions."
    );
    const [showSettings, setShowSettings] = useSyncedState("showSettings", false);
    const [errorMsg, setErrorMsg] = useSyncedState("errorMsg", "");
    usePropertyMenu(
      [
        { itemType: "action", propertyName: "toggleSettings", tooltip: "Settings" },
        { itemType: "separator" },
        { itemType: "action", propertyName: "clearChat", tooltip: "Clear Chat" }
      ],
      ({ propertyName }) => {
        if (propertyName === "toggleSettings") setShowSettings(!showSettings);
        if (propertyName === "clearChat") {
          setMessages([]);
          setErrorMsg("");
        }
      }
    );
    const sendMessage = async () => {
      var _a, _b, _c, _d;
      const text = inputText.trim();
      if (!text || isLoading) return;
      if (!apiKey) {
        setErrorMsg("");
        return;
      }
      const userMsg = { role: "user", content: text };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputText("");
      setIsLoading(true);
      setErrorMsg("");
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content
            }))
          })
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(((_a = err == null ? void 0 : err.error) == null ? void 0 : _a.message) || `HTTP ${response.status}`);
        }
        const data = await response.json();
        const reply = (_d = (_c = (_b = data == null ? void 0 : data.content) == null ? void 0 : _b[0]) == null ? void 0 : _c.text) != null ? _d : "(No response)";
        setMessages([...updatedMessages, { role: "assistant", content: reply }]);
      } catch (err) {
        setErrorMsg(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        direction: "vertical",
        width: WIDGET_WIDTH,
        fill: COLORS.bg,
        cornerRadius: 16,
        stroke: COLORS.border,
        strokeWidth: 1,
        spacing: 0,
        overflow: "hidden"
      },
      /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "horizontal",
          width: "fill-parent",
          padding: { horizontal: 20, vertical: 14 },
          fill: COLORS.surface,
          spacing: 10,
          verticalAlignItems: "center"
        },
        /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            width: 10,
            height: 10,
            cornerRadius: 5,
            fill: isLoading ? COLORS.sending : COLORS.accent
          }
        ),
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 15, fontWeight: 700, fill: COLORS.textPrimary }, "AI Career Assistant"),
        /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent" }),
        /* @__PURE__ */ figma.widget.h(
          Text,
          {
            fontSize: 11,
            fill: COLORS.textSecondary,
            onClick: () => setShowSettings(!showSettings)
          },
          showSettings ? "\u2190 Back" : "\u2699 Settings"
        )
      ),
      showSettings && /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "vertical",
          width: "fill-parent",
          padding: 20,
          fill: COLORS.inputBg,
          spacing: 14
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fontWeight: 600, fill: COLORS.textPrimary }, "API Key"),
        /* @__PURE__ */ figma.widget.h(
          Input,
          {
            value: apiKey,
            placeholder: "sk-ant-...",
            onTextEditEnd: (e) => setApiKey(e.characters),
            fontSize: 12,
            fill: COLORS.textSecondary,
            width: "fill-parent",
            inputBehavior: "password"
          }
        ),
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fontWeight: 600, fill: COLORS.textPrimary }, "System Prompt"),
        /* @__PURE__ */ figma.widget.h(
          Input,
          {
            value: systemPrompt,
            placeholder: "You are a helpful assistant...",
            onTextEditEnd: (e) => setSystemPrompt(e.characters),
            fontSize: 12,
            fill: COLORS.textSecondary,
            width: "fill-parent",
            inputBehavior: "multiline"
          }
        ),
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: COLORS.textSecondary }, "Your API key is stored in this widget only.")
      ),
      !showSettings && /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "vertical",
          width: "fill-parent",
          padding: 16,
          spacing: 12,
          minHeight: 300
        },
        messages.length === 0 && /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            direction: "vertical",
            width: "fill-parent",
            height: "fill-parent",
            horizontalAlignItems: "center",
            padding: { vertical: 40 },
            spacing: 8
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 28 }, "\u{1F4A1}"),
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fill: COLORS.surface, textAlignHorizontal: "center" }, "Ask me anything career related!")
        ),
        messages.map((msg, i) => /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            key: `msg-${i}`,
            direction: "vertical",
            width: "fill-parent",
            horizontalAlignItems: msg.role === "user" ? "end" : "start",
            spacing: 4
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 10, fill: COLORS.textSecondary }, msg.role === "user" ? "You" : "Assistant"),
          /* @__PURE__ */ figma.widget.h(
            AutoLayout,
            {
              padding: { horizontal: 14, vertical: 10 },
              fill: msg.role === "user" ? COLORS.userBubble : COLORS.botBubble,
              cornerRadius: msg.role === "user" ? { topLeft: 12, topRight: 4, bottomLeft: 12, bottomRight: 12 } : { topLeft: 4, topRight: 12, bottomLeft: 12, bottomRight: 12 },
              maxWidth: 300
            },
            /* @__PURE__ */ figma.widget.h(
              Text,
              {
                fontSize: 13,
                fill: COLORS.textPrimary,
                lineHeight: 20
              },
              msg.content
            )
          )
        )),
        isLoading && /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            padding: { horizontal: 14, vertical: 10 },
            fill: COLORS.botBubble,
            cornerRadius: { topLeft: 4, topRight: 12, bottomLeft: 12, bottomRight: 12 }
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fill: COLORS.textSecondary }, "Thinking...")
        ),
        errorMsg !== "" && /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            padding: { horizontal: 14, vertical: 10 },
            fill: "#2D1515",
            cornerRadius: 8,
            stroke: COLORS.error,
            strokeWidth: 1,
            width: "fill-parent"
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: COLORS.error }, errorMsg)
        )
      ),
      !showSettings && /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "horizontal",
          width: "fill-parent",
          padding: 14,
          fill: COLORS.inputBg,
          spacing: 10,
          verticalAlignItems: "center",
          stroke: COLORS.border,
          strokeWidth: 1,
          strokeAlign: "inside"
        },
        /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            fill: COLORS.bg,
            cornerRadius: 10,
            padding: { horizontal: 14, vertical: 10 },
            width: "fill-parent",
            stroke: COLORS.border,
            strokeWidth: 1
          },
          /* @__PURE__ */ figma.widget.h(
            Input,
            {
              value: inputText,
              placeholder: isLoading ? "Waiting for response..." : "Ask something...",
              onTextEditEnd: (e) => setInputText(e.characters),
              fontSize: 13,
              fill: COLORS.border,
              width: "fill-parent",
              inputBehavior: "multiline"
            }
          )
        ),
        /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            padding: { horizontal: 16, vertical: 10 },
            fill: isLoading ? COLORS.border : COLORS.accent,
            cornerRadius: 10,
            onClick: isLoading ? void 0 : sendMessage
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 13, fontWeight: 600, fill: COLORS.textPrimary }, isLoading ? "..." : "Send")
        )
      )
    );
  }
  widget.register(AIChatbotWidget);
})();
