from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import json5  # type: ignore[import-not-found]
import streamlit as st  # type: ignore[import-not-found]


DIRECTIONS = ["left", "right", "up", "down"]
EDGE_COLORS = {
    "left": "#4F8CC9",
    "right": "#D479A3",
    "up": "#7F88CC",
    "down": "#6FA85E"
}
DEFAULT_THEME_BY_MOTIF = {
    "sprout": "#9FD97A",
    "cherry_branch": "#F2A7C2",
    "lavender": "#A788E8",
    "sunflower": "#F2A02D",
    "ginkgo": "#D9A73A",
    "bamboo": "#6FA85E"
}


def find_matching_brace(text: str, start_index: int) -> int:
    depth = 0
    in_string = False
    string_quote = ""
    escape = False

    for index in range(start_index, len(text)):
        char = text[index]

        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == string_quote:
                in_string = False
            continue

        if char in ('"', "'"):
            in_string = True
            string_quote = char
            continue

        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index

    raise ValueError("No matching closing brace found.")


def get_const_object_span(source: str, const_name: str) -> tuple[int, int]:
    marker = f"const {const_name} ="
    marker_index = source.find(marker)
    if marker_index < 0:
        raise ValueError(f"Cannot find '{marker}'.")

    brace_start = source.find("{", marker_index)
    if brace_start < 0:
        raise ValueError(f"Cannot find opening brace for {const_name}.")

    brace_end = find_matching_brace(source, brace_start)
    return brace_start, brace_end


def parse_const_object(source: str, const_name: str) -> Any:
    start, end = get_const_object_span(source, const_name)
    return json5.loads(source[start : end + 1])


def replace_const_object(source: str, const_name: str, value: Any) -> str:
    start, end = get_const_object_span(source, const_name)
    rendered = json.dumps(value, ensure_ascii=False, indent=2)
    return source[:start] + rendered + source[end + 1 :]


def load_structure(app_js_path: Path) -> tuple[dict[str, Any], dict[str, Any], dict[str, str], str]:
    content = app_js_path.read_text(encoding="utf-8")
    pages = parse_const_object(content, "PAGES")
    routes = parse_const_object(content, "ROUTES")
    motif_label = parse_const_object(content, "MOTIF_LABEL")
    return pages, routes, motif_label, content


def save_structure(
    app_js_path: Path,
    original_source: str,
    pages: dict[str, Any],
    routes: dict[str, Any],
    motif_label: dict[str, str]
) -> None:
    updated = replace_const_object(original_source, "PAGES", pages)
    updated = replace_const_object(updated, "ROUTES", routes)
    updated = replace_const_object(updated, "MOTIF_LABEL", motif_label)
    app_js_path.write_text(updated, encoding="utf-8")


def escape_dot_label(value: str) -> str:
    return value.replace('"', '\\"').replace("\n", "\\n")


def to_graphviz_dot(pages: dict[str, Any], routes: dict[str, Any]) -> str:
    lines: list[str] = [
        "digraph route_map {",
        "  rankdir=LR;",
        "  graph [bgcolor=\"transparent\"];",
        "  node [shape=box, style=\"rounded,filled\", color=\"#7C9A7A\", fillcolor=\"#EEF6ED\", fontname=\"Noto Sans\"];",
        "  edge [fontname=\"Noto Sans\"];"
    ]

    for page_key, page_info in pages.items():
        title = str(page_info.get("title") or page_key)
        label = escape_dot_label(f"{page_key}\\n{title}")
        lines.append(f'  "{escape_dot_label(page_key)}" [label="{label}"];')

    for from_page, edges in routes.items():
        if not isinstance(edges, dict):
            continue
        for direction, route in edges.items():
            if not isinstance(route, dict):
                continue
            to_page = str(route.get("targetPage", ""))
            motif = str(route.get("motif", ""))
            color = EDGE_COLORS.get(direction, "#888888")
            label = escape_dot_label(f"{direction} / {motif}")
            lines.append(
                f'  "{escape_dot_label(from_page)}" -> "{escape_dot_label(to_page)}" '
                f'[label="{label}", color="{color}", fontcolor="{color}", penwidth=1.7];'
            )

    lines.append("}")
    return "\n".join(lines)


def panel_text_from_list(panels: list[dict[str, str]]) -> str:
    rows = []
    for panel in panels:
        heading = str(panel.get("heading", "")).strip()
        text = str(panel.get("text", "")).strip()
        rows.append(f"{heading}|{text}")
    return "\n".join(rows)


def panel_list_from_text(value: str) -> list[dict[str, str]]:
    rows = []
    for line in value.splitlines():
        raw = line.strip()
        if not raw:
            continue
        if "|" in raw:
            heading, text = raw.split("|", 1)
        else:
            heading, text = raw, ""
        rows.append({"heading": heading.strip(), "text": text.strip()})
    return rows


def collect_motif_theme_map(routes: dict[str, Any]) -> dict[str, str]:
    theme_map = dict(DEFAULT_THEME_BY_MOTIF)
    for edge_map in routes.values():
        if not isinstance(edge_map, dict):
            continue
        for route in edge_map.values():
            if not isinstance(route, dict):
                continue
            motif = str(route.get("motif", "")).strip()
            theme = str(route.get("themeColor", "")).strip()
            if motif and theme:
                theme_map[motif] = theme
    return theme_map


def collect_motif_options(
    routes: dict[str, Any],
    motif_label: dict[str, str],
    current_motif: str
) -> list[str]:
    motifs = set(motif_label.keys())
    motifs.update(DEFAULT_THEME_BY_MOTIF.keys())
    motifs.add(current_motif)

    for edge_map in routes.values():
        if not isinstance(edge_map, dict):
            continue
        for route in edge_map.values():
            if not isinstance(route, dict):
                continue
            motif = str(route.get("motif", "")).strip()
            if motif:
                motifs.add(motif)

    return sorted(value for value in motifs if value)


def ensure_flash():
    message = st.session_state.pop("flash_message", "")
    level = st.session_state.pop("flash_level", "info")
    if not message:
        return
    if level == "success":
        st.success(message)
    elif level == "error":
        st.error(message)
    else:
        st.info(message)


def flash(message: str, level: str = "info"):
    st.session_state["flash_message"] = message
    st.session_state["flash_level"] = level


def main() -> None:
    st.set_page_config(page_title="Sprout 页面编辑器", layout="wide")
    st.title("Sprout 页面可视化编辑器")
    st.caption("读取 app.js 中的 PAGES / ROUTES / MOTIF_LABEL，图形化编辑并实时回写。")

    root = Path(__file__).resolve().parent
    default_path = root / "app.js"

    app_js_input = st.text_input("app.js 路径", value=str(default_path))
    app_js_path = Path(app_js_input).expanduser()

    ensure_flash()

    if not app_js_path.exists():
        st.error("app.js 路径不存在，请先修正路径。")
        return

    try:
        pages, routes, motif_label, source = load_structure(app_js_path)
    except Exception as error:  # noqa: BLE001
        st.error(f"读取失败：{error}")
        return

    top_col1, top_col2, top_col3 = st.columns([1, 1, 2])
    with top_col1:
        st.metric("页面数", len(pages))
    with top_col2:
        route_count = sum(len(v) for v in routes.values() if isinstance(v, dict))
        st.metric("连接数", route_count)
    with top_col3:
        if st.button("从文件重新加载"):
            flash("已从 app.js 重新加载。", "success")
            st.rerun()

    st.subheader("路由图")
    st.graphviz_chart(to_graphviz_dot(pages, routes), use_container_width=True)

    tab_pages, tab_routes, tab_motif = st.tabs(["页面管理", "连接管理", "Motif 标签"])

    with tab_pages:
        st.markdown("### 新增页面")
        with st.form("add_page_form"):
            new_key = st.text_input("页面 key（英文小写，示例：new_page）")
            new_eyebrow = st.text_input("Eyebrow", value="New")
            new_title = st.text_input("标题", value="新页面")
            new_subtitle = st.text_area("副标题", value="这里是新页面描述。", height=80)
            panel_blob = st.text_area(
                "Panels（每行：heading|text）",
                value="模块一|描述\n模块二|描述",
                height=90
            )
            add_page_submit = st.form_submit_button("新增页面")

        if add_page_submit:
            key = new_key.strip()
            if not key:
                flash("页面 key 不能为空。", "error")
                st.rerun()
            if key in pages:
                flash(f"页面 {key} 已存在。", "error")
                st.rerun()

            pages[key] = {
                "eyebrow": new_eyebrow.strip() or "New",
                "title": new_title.strip() or key,
                "subtitle": new_subtitle.strip(),
                "panels": panel_list_from_text(panel_blob)
            }
            routes.setdefault(key, {})
            save_structure(app_js_path, source, pages, routes, motif_label)
            flash(f"已新增页面：{key}", "success")
            st.rerun()

        st.markdown("### 编辑 / 删除页面")
        page_keys = list(pages.keys())
        edit_key = st.selectbox("选择页面", options=page_keys, key="edit_page_select")
        page_data = pages.get(edit_key, {})

        with st.form("edit_page_form"):
            eyebrow = st.text_input("Eyebrow", value=str(page_data.get("eyebrow", "")))
            title = st.text_input("标题", value=str(page_data.get("title", "")))
            subtitle = st.text_area("副标题", value=str(page_data.get("subtitle", "")), height=80)
            panels_text = st.text_area(
                "Panels（每行：heading|text）",
                value=panel_text_from_list(page_data.get("panels", [])),
                height=120
            )
            save_page_submit = st.form_submit_button("保存页面内容")

        if save_page_submit:
            pages[edit_key] = {
                "eyebrow": eyebrow.strip(),
                "title": title.strip(),
                "subtitle": subtitle.strip(),
                "panels": panel_list_from_text(panels_text)
            }
            save_structure(app_js_path, source, pages, routes, motif_label)
            flash(f"已保存页面：{edit_key}", "success")
            st.rerun()

        with st.form("delete_page_form"):
            confirm_delete = st.checkbox(f"确认删除页面 {edit_key}")
            delete_page_submit = st.form_submit_button("删除页面")

        if delete_page_submit:
            if not confirm_delete:
                flash("请先勾选确认删除。", "error")
                st.rerun()

            pages.pop(edit_key, None)
            routes.pop(edit_key, None)
            for from_page, edge_map in list(routes.items()):
                if not isinstance(edge_map, dict):
                    continue
                filtered = {
                    direction: route
                    for direction, route in edge_map.items()
                    if str(route.get("targetPage", "")) != edit_key
                }
                routes[from_page] = filtered

            save_structure(app_js_path, source, pages, routes, motif_label)
            flash(f"已删除页面：{edit_key}，并清理相关连接。", "success")
            st.rerun()

    with tab_routes:
        st.markdown("### 新增 / 修改连接")
        from_page = st.selectbox("From 页面", options=list(pages.keys()), key="route_from")
        direction = st.selectbox("方向", options=DIRECTIONS, key="route_direction")

        current_route = routes.get(from_page, {}).get(direction, {})
        target_options = list(pages.keys())
        default_target = str(current_route.get("targetPage", target_options[0] if target_options else ""))
        target_index = target_options.index(default_target) if default_target in target_options else 0

        current_motif = str(current_route.get("motif", "sprout")).strip() or "sprout"
        motif_theme_map = collect_motif_theme_map(routes)
        motif_options = collect_motif_options(routes, motif_label, current_motif)
        motif_index = motif_options.index(current_motif) if current_motif in motif_options else 0

        target_page = st.selectbox("To 页面", options=target_options, index=target_index, key="route_to")
        motif = st.selectbox("motif", options=motif_options, index=motif_index, key="route_motif")
        auto_theme = motif_theme_map.get(
            motif,
            str(current_route.get("themeColor", "")).strip() or "#9FD97A"
        )
        st.text_input("themeColor（自动，跟随 motif）", value=auto_theme, disabled=True)

        upsert_route_submit = st.button("保存连接", key="save_route")
        if upsert_route_submit:
            routes.setdefault(from_page, {})[direction] = {
                "targetPage": target_page,
                "motif": motif.strip() or "sprout",
                "themeColor": auto_theme
            }
            motif_name = routes[from_page][direction]["motif"]
            motif_label.setdefault(motif_name, motif_name)
            save_structure(app_js_path, source, pages, routes, motif_label)
            flash(f"已更新连接：{from_page} -> {direction} -> {target_page}", "success")
            st.rerun()

        st.markdown("### 删除连接")
        with st.form("delete_route_form"):
            del_from = st.selectbox("From 页面", options=list(pages.keys()), key="del_route_from")
            del_direction = st.selectbox("方向", options=DIRECTIONS, key="del_route_direction")
            delete_route_submit = st.form_submit_button("删除该方向连接")

        if delete_route_submit:
            if del_direction in routes.get(del_from, {}):
                routes[del_from].pop(del_direction, None)
                save_structure(app_js_path, source, pages, routes, motif_label)
                flash(f"已删除连接：{del_from}.{del_direction}", "success")
            else:
                flash("该方向当前没有连接可删除。", "error")
            st.rerun()

    with tab_motif:
        st.markdown("### Motif 标签映射（用于提示文案）")

        motif_json = st.text_area(
            "MOTIF_LABEL JSON",
            value=json.dumps(motif_label, ensure_ascii=False, indent=2),
            height=220
        )

        if st.button("保存 MOTIF_LABEL"):
            try:
                parsed = json.loads(motif_json)
                if not isinstance(parsed, dict):
                    raise ValueError("MOTIF_LABEL 必须是对象。")
                motif_label = {str(k): str(v) for k, v in parsed.items()}
                save_structure(app_js_path, source, pages, routes, motif_label)
                flash("MOTIF_LABEL 已保存。", "success")
            except Exception as error:  # noqa: BLE001
                flash(f"MOTIF_LABEL 保存失败：{error}", "error")
            st.rerun()


if __name__ == "__main__":
    main()
