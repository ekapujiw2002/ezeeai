import pandas as pd
import csv


def clean_field_names(filename):
    args = {}
    if not has_header(filename):
        args['header'] = None
    df = pd.read_csv(filename, sep=None, engine='python', **args)
    df.columns = df.columns.astype(str)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    df.columns = df.columns.str.replace('(', '').str.replace(')', '').str.replace('.', '_')
    df.columns = df.columns.str.replace('=', '_').str.replace(':', '-')

    # if columns duplicated change :
    cols = pd.Series(df.columns)
    for dup in df.columns.get_duplicates():
        cols[df.columns.get_loc(dup)] = [dup + '_' + str(d_idx) if d_idx != 0 else dup for d_idx in
                                         range(df.columns.get_loc(dup).sum())]
    df.columns = cols
    df.to_csv(filename, index=False)


def clean_field_names_df(file, filename):
    args = {}
    if not has_header(file, False):
        args['header'] = None

    df = pd.read_csv(file, sep=None, engine='python', **args)
    df.columns = df.columns.astype(str)
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    df.columns = df.columns.str.replace('(', '').str.replace(')', '').str.replace('.', '_')
    df.columns = df.columns.str.replace('=', '_').str.replace(':', '-')
    df.to_csv(filename, index=False)
    # if columns duplicated change :
    cols = pd.Series(df.columns)
    for dup in df.columns.get_duplicates():
        cols[df.columns.get_loc(dup)] = [dup + '_' + str(d_idx) if d_idx != 0 else dup for d_idx in
                                         range(df.columns.get_loc(dup).sum())]
    df.columns = cols
    return df


def check_train(train_file, targets):
    if len(targets) > 1:
        return True
    df = pd.read_csv(train_file)
    if df[targets[0]].dtype == 'object':
        if len(df[targets[0]].unique()) < 2:
            return False
    return True


def has_header(csvfile, close=True):
    if isinstance(csvfile, str):
        csvfile = open(csvfile, 'r')

    sniffer = csv.Sniffer()
    has_header = sniffer.has_header(csvfile.read(100))
    if close:
        csvfile.close()
    else:
        csvfile.seek(0)
    return has_header
