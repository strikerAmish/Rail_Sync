with open('backend/main.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('if __name__ == "__main__":\n\nif __name__ == "__main__":', 'if __name__ == "__main__":')
text = text.replace('if __name__ == "__main__":\r\n\r\nif __name__ == "__main__":', 'if __name__ == "__main__":')

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Cleaned!")

