from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from random import random
import requests
from flask_cors import CORS
import google.generativeai as genai
import json
import os
import re # Importar para usar regex na extração do JSON
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from functools import wraps
 # Carrega as variáveis do .env
import psycopg2
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # use variável de ambiente


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
app.secret_key = '154f41c773b32702cacb63564e6a8e85'
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
CORS(app)

UPLOAD_FOLDER = 'static/img/fotosperfil'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_connection():
    """Cria uma conexão segura com o banco Neon."""
    return psycopg2.connect(DATABASE_URL, sslmode='require')


def init_db():
    """Cria a tabela de usuários no banco Neon, se ainda não existir."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    foto_perfil TEXT,
                    intro_progress_stage INTEGER DEFAULT 0,
                    total_essays_written INTEGER DEFAULT 0
                )
            ''')
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO usuarios (username, email, password, foto_perfil)
                    VALUES (%s, %s, %s, %s)
                """, ('testeuser', 'teste@example.com', '12345', '/static/img/perfil2.png'))
                conn.commit()
                print("✅ Usuário de teste 'testeuser' (senha: 12345) adicionado ao banco Neon.")


def usuario_existe_por_username(username):
    """Verifica se um usuário com o nome de usuário fornecido já existe."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM usuarios WHERE username = %s", (username,))
            return cursor.fetchone() is not None


def usuario_existe_por_email(email):
    """Verifica se um usuário com o e-mail fornecido já existe."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM usuarios WHERE email = %s", (email,))
            return cursor.fetchone() is not None


def validar_usuario(login, senha):
    """Valida as credenciais de login do usuário."""
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT 1 FROM usuarios
                WHERE (username = %s OR email = %s) AND password = %s
            ''', (login, login, senha))
            return cursor.fetchone() is not None

def validar_recaptcha(captcha_response):
    """Valida a resposta do reCAPTCHA com a API do Google."""
    payload = {
        'secret': RECAPTCHA_SECRET_KEY,
        'response': captcha_response
    }
    resposta = requests.post('https://www.google.com/recaptcha/api/siteverify', data=payload)
    resultado = resposta.json()
    return resultado.get('success')

def get_user_id_from_session():
    """Obtém o ID do usuário logado a partir da sessão."""
    username_or_email = session.get('username')
    if not username_or_email:
        return None
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM usuarios WHERE username = %s OR email = %s", (username_or_email, username_or_email))
        result = cursor.fetchone()
        return result[0] if result else None

# Dados de exercícios centralizados (para Fase 1)
exercicios_introducao_data_backend = {
    "lacunas": [
        {
            "id": 1,
            "contexto": "No contexto da sociedade contemporânea, marcada pela intensa circulação de informações nas <lacuna id='l0'>______</lacuna> digitais e pela velocidade das transformações, a capacidade de redigir de forma <lacuna id='l1'>______</lacuna> torna-se uma habilidade fundamental. A <lacuna id='l2'>______</lacuna> não é apenas um instrumento de comunicação, mas também uma ferramenta poderosa para a <lacuna id='l3'>______</lacuna> do conhecimento, a <lacuna id='l4'>______</lacuna> de ideias e a <lacuna id='l5'>______</lacuna> de argumentos.",
            "gaps": [
                {"id": 0, "correct_answer": "redes", "options": ["redes", "mídias", "fontes"]},
                {"id": 1, "correct_answer": "eficaz", "options": ["eficaz", "rápida", "simples"]},
                {"id": 2, "correct_answer": "escrita", "options": ["escrita", "leitura", "fala"]},
                {"id": 3, "correct_answer": "construção", "options": ["construção", "destruição", "negação"]},
                {"id": 4, "correct_answer": "expressão", "options": ["expressão", "retenção", "ocultação"]},
                {"id": 5, "correct_answer": "formulação", "options": ["formulação", "aceitação", "refutação"]}
            ]
        },
    ],
    "ordemInvertida": [
        {
            "id": 1,
            "pergunta": "Organize as frases para formar uma introdução coerente:",
            "frases": [
                {"id": "frase1", "texto": "Em primeiro lugar, a educação formal desempenha um papel crucial."},
                {"id": "frase2", "texto": "Além disso, a interação social e a experiência prática contribuem para o desenvolvimento pessoal."},
                {"id": "frase3", "texto": "O desenvolvimento humano é um processo complexo e multifacetado."},
                {"id": "frase4", "texto": "Por fim, a capacidade de adaptação e a resiliência são qualidades essenciais para o crescimento contínuo."}
            ],
            "ordemCorretaIds": ["frase3", "frase1", "frase2", "frase4"]
        },
        {
            "id": 2,
            "pergunta": "Coloque os passos para o desenvolvimento de um texto em ordem:",
            "frases": [
                {"id": "passo1", "texto": "Revisar e editar o texto, buscando clareza e correção."},
                {"id": "passo2", "texto": "Definir o tema e o objetivo do texto."},
                {"id": "passo3", "texto": "Organizar as ideias em um esboço ou roteiro."},
                {"id": "passo4", "texto": "Escrever o primeiro rascunho, sem se preocupar excessivamente com a perfeição."}
            ],
            "ordemCorretaIds": ["passo2", "passo3", "passo4", "passo1"]
        }
    ]
}


# --- Rotas da Aplicação ---

@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        username_or_email = request.form['username_or_email']
        password = request.form['password']
        captcha_response = request.form['g-recaptcha-response']

        if not validar_recaptcha(captcha_response):
            erro = 'Verificação de segurança falhou. Tente novamente.'
        else:
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT username, email, foto_perfil 
                    FROM usuarios 
                    WHERE (username = %s OR email = %s) AND password = %s
                ''', (username_or_email, username_or_email, password))
                user = cursor.fetchone()
            if user:
                username, email, foto_perfil = user
                session['username'] = username
                session['email'] = email
                session['foto_perfil'] = foto_perfil if foto_perfil else None
                return redirect(url_for('welcome'))
            else:
                erro = 'Usuário, e-mail ou senha inválidos.'

    return render_template('login.html', error=erro, active_page='login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    erro = None
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if usuario_existe_por_username(username):
            erro = 'Usuário já existe.'
            return render_template('register.html', error=erro)

        if usuario_existe_por_email(email):
            erro = 'E-mail já registrado.'
            return render_template('register.html', error=erro)

        if password != confirm_password:
            erro = 'As senhas não coincidem.'
            return render_template('register.html', error=erro)

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO usuarios (username, email, password) VALUES (%s, %s, %s)',
                           (username, email, password))
            conn.commit()

        session['username'] = username
        return redirect(url_for('questionario', etapa=1))

    return render_template('register.html', error=erro, active_page='register')

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    erro = None
    success = None
    if request.method == 'POST':
        email = request.form['email']

        if not usuario_existe_por_email(email):
            erro = 'Este e-mail não está registrado.'
            return render_template('forgot_password.html', error=erro)

        # Simula o envio de link de redefinição de senha
        success = f"Um link para redefinir sua senha foi enviado para {email}!"
        return render_template('forgot_password.html', success=success)

    return render_template('forgot_password.html', error=erro)

@app.route('/questionario/<int:etapa>', methods=['GET', 'POST'])
def questionario(etapa):
    if 'username' not in session:
        return redirect(url_for('login'))

    if etapa == 1:
        if request.method == 'POST':
            resposta = request.form.get('resposta')
            if resposta:
                session['redacoes'] = resposta
                return redirect(url_for('questionario', etapa=2))
        pergunta = "Quantas vezes você já escreveu redações?"
        opcoes = [
            ("a", "Eu já escrevi redações diversas vezes"),
            ("b", "Eu escrevi redações poucas vezes"),
            ("c", "Eu nunca escrevi uma redação"),
        ]

    elif etapa == 2:
        if request.method == 'POST':
            resposta = request.form.get('resposta')
            if resposta:
                session['tempo_estudo'] = resposta
                return redirect(url_for('questionario', etapa=3))
        pergunta = "Quantas horas por dia você tem para estudar?"
        opcoes = [
            ("a", "Mais de uma hora"),
            ("b", "Entre meia hora e uma hora"),
            ("c", "Meia hora ou menos"),
        ]

    elif etapa == 3:
        if request.method == 'POST':
            resposta = request.form.get('resposta')
            if resposta:
                session['dificuldade'] = resposta
                return redirect(url_for('welcome'))
        pergunta = "Qual sua maior dificuldade na estrutura de uma redação?"
        opcoes = [
            ("a", "Introdução"),
            ("b", "Desenvolvimento"),
            ("c", "Conclusão"),
        ]

    else:
        return redirect(url_for('questionario', etapa=1))

    return render_template('questionario/pergunta.html', etapa=etapa, pergunta=pergunta, opcoes=opcoes, ultima_etapa=(etapa == 3))

@app.route('/index')
def index():
    return render_template('index.html')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/welcome')
@login_required
def welcome():
    username = session['username']
    foto_perfil = session.get('foto_perfil')
    return render_template('welcome.html', username=username, foto_perfil=foto_perfil, random=random)

@app.route('/welcome/biblioteca')
@login_required
def biblioteca():
    username = session['username']
    foto_perfil = session.get('foto_perfil')
    return render_template('biblioteca.html', username=username, foto_perfil=foto_perfil, random=random)

@app.route('/welcome/conquistas')
@login_required
def conquistas():
    username = session['username']
    foto_perfil = session.get('foto_perfil')
    return render_template('conquistas.html', username=username, foto_perfil=foto_perfil, random=random)

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('login'))

@app.route('/welcome/perfil', methods=['GET', 'POST'])
def perfil(): 
    login_identifier = session.get('username')

    if not login_identifier:
        return redirect(url_for('login'))

    with get_connection() as conn:
        cursor = conn.cursor()

        if request.method == 'POST':
            novo_username = request.form['edit-username']
            novo_email = request.form['edit-email']
            nova_senha = request.form.get('edit-password')
            foto = request.files.get('foto')

            caminho_foto = None
            if foto and foto.filename and allowed_file(foto.filename):
                extensao = foto.filename.rsplit('.', 1)[1].lower()
                filename = secure_filename(f"{session['username']}_foto.{extensao}")
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                caminho_foto = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                foto.save(caminho_foto)
                caminho_foto = '/' + caminho_foto.replace('\\', '/')

            cursor.execute('''
                SELECT username, email, foto_perfil FROM usuarios
                WHERE username = %s OR email = %s
            ''', (login_identifier, login_identifier))
            current_user_data = cursor.fetchone()
            current_foto_perfil = current_user_data[2] if current_user_data else None

            update_fields = []
            update_values = []

            if novo_username != login_identifier and usuario_existe_por_username(novo_username):
                flash('Nome de usuário já existe.', 'error')
                return redirect(url_for('perfil'))
            elif not novo_username.strip():
                flash('Nome de usuário não pode ser vazio.', 'error')
                return redirect(url_for('perfil'))
            else:
                update_fields.append("username = %s")
                update_values.append(novo_username)
                session['username'] = novo_username # Atualiza a sessão imediatamente

            # Se o novo email for diferente e já existir, ou se for vazio, trate o erro
            if novo_email != current_user_data[1] and usuario_existe_por_email(novo_email):
                flash('Email já existe.', 'error')
                return redirect(url_for('perfil'))
            elif not novo_email.strip():
                flash('Email não pode ser vazio.', 'error')
                return redirect(url_for('perfil'))
            else:
                update_fields.append("email = %s")
                update_values.append(novo_email)

            if nova_senha:
                update_fields.append("password = %s")
                update_values.append(nova_senha)

            if caminho_foto:
                update_fields.append("foto_perfil = %s")
                update_values.append(caminho_foto)
                session['foto_perfil'] = caminho_foto
            elif 'delete_foto' in request.form:
                update_fields.append("foto_perfil = %s")
                update_values.append(None)
                session['foto_perfil'] = None

            if update_fields:
                update_query = f"UPDATE usuarios SET {', '.join(update_fields)} WHERE username = %s OR email = %s"
                update_values.extend([login_identifier, login_identifier])
                cursor.execute(update_query, tuple(update_values))
                conn.commit()
                flash("Perfil atualizado com sucesso!", "success")
            else:
                flash("Nenhuma alteração a ser salva.", "info")

            return redirect(url_for('perfil'))

        cursor.execute('''
            SELECT username, email, foto_perfil FROM usuarios
            WHERE username = %s OR email = %s
        ''', (login_identifier, login_identifier))
        resultado = cursor.fetchone()

        if resultado:
            username, email, foto_perfil = resultado
            # Certifique-se de que foto_perfil é um caminho de URL válido
            if foto_perfil and not foto_perfil.startswith('/static/'):
                foto_perfil = '/' + foto_perfil # Garante que o caminho seja absoluto para /static
        else:
            username, email, foto_perfil = 'Desconhecido', 'desconhecido@example.com', None
            flash('Usuário não encontrado.', 'error')
            return redirect(url_for('login'))
        session['foto_perfil'] = foto_perfil
    return render_template('perfil.html', username=username, email=email, foto_perfil=foto_perfil, random=random)

@app.route('/fase1')
def fase1_intro():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('fases/fase1_intro.html', username=session['username'])

@app.route('/fase2')
def fase2_desenvolvimento():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('fases/fase_desenvolvimento.html', username=session['username'])

@app.route('/fase3')
def fase3_conclusao():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('fases/fase_conclusao.html', username=session['username'])

@app.route('/redacao-final')
def redacao_final():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('fases/redacao_final.html', username=session['username'])

@app.route('/fase1/perguntas', methods=['GET', 'POST'])
def fase1_perguntas():
    if 'username' not in session:
        return redirect(url_for('login'))

    return render_template('fases/fase1_perguntas.html', texto=exercicios_introducao_data_backend, username=session['username'])

@app.route('/verificar_lacunas_introducao', methods=['POST'])
def verificar_lacunas_introducao():
    data = request.json
    cenario_id = data.get('cenario_id')
    respostas_usuario = data.get('respostas_usuario', {})

    cenario_encontrado = next((c for c in exercicios_introducao_data_backend["lacunas"] if c["id"] == cenario_id), None)

    if not cenario_encontrado:
        return jsonify({"correto": False, "mensagem": "Cenário de lacunas não encontrado."}), 404

    acertos = 0
    detalhes_verificacao = []

    for gap in cenario_encontrado["gaps"]:
        idx = str(gap["id"])
        resposta_correta = gap["correct_answer"]

        resposta_usuario = respostas_usuario.get(idx, '').lower().strip()
        resposta_correta_lower = resposta_correta.lower().strip()

        acertou = (resposta_usuario == resposta_correta_lower)
        if acertou:
            acertos += 1
        detalhes_verificacao.append({
            "index": idx,
            "resposta": respostas_usuario.get(idx, ''),
            "correta": resposta_correta,
            "acertou": acertou
        })

    correto_total = (acertos == len(cenario_encontrado["gaps"]))

    # Se todas as lacunas estiverem corretas, atualiza o progresso do usuário para Stage 1
    if correto_total:
        user_id = get_user_id_from_session()
        if user_id:
            with get_connection() as conn:
                cursor = conn.cursor()
                # MAX(intro_progress_stage, 1) garante que o estágio só avance, nunca retroceda.
                cursor.execute("UPDATE usuarios SET intro_progress_stage = MAX(intro_progress_stage, 1) WHERE id = %s", (user_id,))
                conn.commit()

    return jsonify({"correto": correto_total, "detalhes": detalhes_verificacao})


@app.route('/verificar_ordem_introducao', methods=['POST'])
def verificar_ordem_introducao():
    data = request.get_json()
    cenario_id = data.get('cenario_id')
    ordem_usuario = data.get('ordem_usuario')

    cenario_correto = next((c for c in exercicios_introducao_data_backend["ordemInvertida"] if c["id"] == cenario_id), None)

    if cenario_correto:
        if ordem_usuario == cenario_correto["ordemCorretaIds"]:
            # Se a ordem estiver correta, atualiza o progresso do usuário para Stage 2
            user_id = get_user_id_from_session()
            if user_id:
                with get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("UPDATE usuarios SET intro_progress_stage = MAX(intro_progress_stage, 2) WHERE id = %s", (user_id,))
                    conn.commit()
            return jsonify({"correto": True, "mensagem": "Parabéns! A ordem está correta!"})
        else:
            return jsonify({"correto": False, "mensagem": "A ordem está incorreta. Tente novamente."})
    else:
        return jsonify({"correto": False, "mensagem": "Cenário de ordenação não encontrado."}), 404

# --- Nova Rota para Salvar e Avançar após o Exercício de Escrita ---
@app.route('/save_and_advance_intro_phase', methods=['POST'])
def save_and_advance_intro_phase():
    if 'username' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    user_id = get_user_id_from_session()
    if not user_id:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Get the score from the request if sent from frontend
    score = request.json.get('score', 0) # Assuming score is sent with this request

    with get_connection() as conn:
        cursor = conn.cursor()
        # Atualiza o estágio para 3 e incrementa o total de redações escritas
        cursor.execute("UPDATE usuarios SET intro_progress_stage = MAX(intro_progress_stage, 3), total_essays_written = total_essays_written + 1 WHERE id = %s", (user_id,))
        conn.commit()

    # Store the score in the session
    session['last_essay_score'] = score

    return jsonify({"success": True, "message": "Progresso da introdução salvo e avançado."})

@app.route('/api/user_progress', methods=['GET'])
def get_user_progress():
    """
    Retorna o progresso do usuário (e.g., estágio da introdução, redações escritas).
    """
    user_id = get_user_id_from_session()
    if not user_id:
        return jsonify({"error": "Usuário não logado"}), 401

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT intro_progress_stage, total_essays_written FROM usuarios WHERE id = %s", (user_id,))
        result = cursor.fetchone()

        if result:
            intro_progress_stage, total_essays_written = result
            return jsonify({
                "intro_progress_stage": intro_progress_stage,
                "total_essays_written": total_essays_written
            })
        else:
            return jsonify({"error": "Dados do usuário não encontrados"}), 404

@app.route('/congratulations')
def congratulations():
    if 'username' not in session:
        return redirect(url_for('login'))

    username = session.get('username')
    essay_score = session.pop('last_essay_score', 'N/A') # Get and remove the score from session

    return render_template('congratulations.html', username=username, essay_score=essay_score)


if __name__ == '__main__':
    init_db()
    app.run(debug=True)